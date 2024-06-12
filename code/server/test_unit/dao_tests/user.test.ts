import { describe, test, expect, beforeAll, afterAll, jest, beforeEach, afterEach } from "@jest/globals"

import UserController from "../../src/controllers/userController"
import UserDAO from "../../src/dao/userDAO"
import crypto from "crypto"
import db from "../../src/db/db"
import { Database } from "sqlite3"
import { error } from "console"
import { UserAlreadyExistsError, UserNotFoundError } from "../../src/errors/userError"
import { Role, User } from "../../src/components/user"

jest.mock("crypto")
jest.mock("../../src/db/db.ts")

describe("UserDAO tests:", () => {

    afterEach (() => {
        jest.clearAllMocks();
    });
    
    beforeEach((): void => {
        jest.setTimeout(60000);
    });

    describe("getIsUserAuthenticathed tests:", () => {
        test("It should be true", async () => {
            const userDAO = new UserDAO()
            const row = {
                username: "username",
                password: "test",
                salt: "test"
            }
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, row);
                return {} as Database
            });
            const mockEqual = jest.spyOn(crypto, "timingSafeEqual").mockImplementation(() => {return true})
            const result = await userDAO.getIsUserAuthenticated("username", "plainPassword");
            expect(result).toBe(true);
            mockDBGet.mockRestore()
            mockEqual.mockRestore()
        })

        test("It should be false", async () => {
            const userDAO = new UserDAO()
            const row = {
                username: "username",
                password: "test",
                salt: "test"
            }
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, row);
                return {} as Database
            });
            const mockEqual = jest.spyOn(crypto, "timingSafeEqual").mockImplementation(() => {return false})
            const result = await userDAO.getIsUserAuthenticated("username", "plainPassword");
            expect(result).toBe(false);
            mockDBGet.mockRestore()
            mockEqual.mockRestore()
        })

        test("It should be false", async () => {
            const userDAO = new UserDAO()
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback()
                return {} as Database
            });
            const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementation(async (password, salt, keylen) => {
                return Buffer.from("hashedPassword")
            })
            const result = await userDAO.getIsUserAuthenticated("username", "plainPassword");
            expect(result).toBe(false)
            mockDBGet.mockRestore()
            mockScrypt.mockRestore()
        })

        test("It should reject Error", async () => {
            const userDAO = new UserDAO()
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(new Error)
                return {} as Database
            });
            const result = userDAO.getIsUserAuthenticated("username", "plainPassword");
            await expect(result).rejects.toThrow(Error);
            mockDBGet.mockRestore()
        })

        test("It should reject error", async () => {
            const userDAO = new UserDAO()
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                throw error;
            });

            try {
                await userDAO.getIsUserAuthenticated("username", "plainPassword")
            } catch(e) {
                expect(e).toBe(error)
            }

            mockDBGet.mockRestore()
        })
    })

    describe("createUser tests:", () => {
        test("It should resolve true", async () => {
            const userDAO = new UserDAO()
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null)
                return {} as Database
            });
            const mockRandomBytes = jest.spyOn(crypto, "randomBytes").mockImplementation((size) => {
                return (Buffer.from("salt"))
            })
            const mockScrypt = jest.spyOn(crypto, "scrypt").mockImplementation(async (password, salt, keylen) => {
                return Buffer.from("hashedPassword")
            })
            const result = await userDAO.createUser("username", "name", "surname", "password", "role")
            expect(result).toBe(true)
            mockRandomBytes.mockRestore()
            mockDBRun.mockRestore()
            mockScrypt.mockRestore()
        })

        test("It should reject Error", async () => {
            const userDAO = new UserDAO()
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Error"))
                return {} as Database
            });
            const result = userDAO.createUser("username", "name", "surname", "password", "role")
            await expect(result).rejects.toThrow(Error);
            mockDBRun.mockRestore()
        })

        test("It should reject UserAlreadyExistsError", async () => {
            const userDAO = new UserDAO()
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("UNIQUE constraint failed: users.username"))
                return {} as Database
            });
            const result = userDAO.createUser("username", "name", "surname", "password", "role")
            await expect(result).rejects.toThrow(UserAlreadyExistsError)
            mockDBRun.mockRestore()
        })

        test("It should reject error", async () => {
            const userDAO = new UserDAO()
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                throw error;
            });

            try {
                await userDAO.createUser("username", "name", "surname", "password", "role")
            } catch(e) {
                expect(e).toBe(error)
            }

            mockDBRun.mockRestore()
        })
    })

    describe("getUserByUsername tests:", () => {
        test("It should resolve user", async () => {
            const userDAO = new UserDAO()
            const user = new User("username", "test", "test", Role.CUSTOMER, "test", "test");
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(undefined, user)
                return {} as Database
            });
            const result = userDAO.getUserByUsername("username");
            await expect(result).resolves.toStrictEqual(user);
            mockDBGet.mockRestore()
        })

        test("It should reject UserNotFoundError", async () => {
            const userDAO = new UserDAO()
            const user = new User("username", "test", "test", Role.CUSTOMER, "test", "test");
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback()
                return {} as Database
            });
            const result = userDAO.getUserByUsername("username");
            await expect(result).rejects.toThrow(UserNotFoundError);
            mockDBGet.mockRestore()
        })

        test("It should reject Error", async () => {
            const userDAO = new UserDAO()
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(new Error("Error"))
                return {} as Database
            });
            const result = userDAO.getUserByUsername("username");
            await expect(result).rejects.toThrow(Error)
            mockDBGet.mockRestore()
        })

        test("It should reject error", async () => {
            const userDAO = new UserDAO()
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                throw error;
            });

            try {
                await userDAO.getUserByUsername("username");
            } catch(e) {
                expect(e).toBe(error)
            }

            mockDBGet.mockRestore()
        })
    })

    describe("getUser tests:", () => {
        test("It should resolve user", async () => {
            const userDAO = new UserDAO()
            const user1 = new User("test1", "test", "test", Role.CUSTOMER, "test", "test");
            const user2 = new User("test2", "test", "test", Role.CUSTOMER, "test", "test");
            const users = [user1, user2];
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(undefined, users)
                return {} as Database
            });
            const result = userDAO.getUser();
            await expect(result).resolves.toStrictEqual(users);
            mockDBAll.mockRestore()
        })

        test("It should reject Error", async () => {
            const userDAO = new UserDAO()
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(new Error("Error"))
                return {} as Database
            });
            const result = userDAO.getUser();
            await expect(result).rejects.toThrow(Error)
            mockDBAll.mockRestore()
        })

        test("It should reject error", async () => {
            const userDAO = new UserDAO()
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                throw error;
            });

            try {
                await userDAO.getUser();
            } catch(e) {
                expect(e).toBe(error)
            }

            mockDBAll.mockRestore()
        })
    })

    describe("getUserByRole tests:", () => {
        test("It should resolve users", async () => {
            const userDAO = new UserDAO()
            const user1 = new User("test1", "test", "test", Role.CUSTOMER, "test", "test");
            const user2 = new User("test2", "test", "test", Role.CUSTOMER, "test", "test");
            const users = [user1, user2];
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(undefined, users)
                return {} as Database
            });
            const result = userDAO.getUserByRole(Role.CUSTOMER);
            await expect(result).resolves.toStrictEqual(users);
            mockDBAll.mockRestore()
        })

        test("It should reject Error", async () => {
            const userDAO = new UserDAO()
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(new Error("Error"))
                return {} as Database
            });
            const result = userDAO.getUserByRole(Role.CUSTOMER);
            await expect(result).rejects.toThrow(Error)
            mockDBAll.mockRestore()
        })

        test("It should reject error", async () => {
            const userDAO = new UserDAO()
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                throw error;
            });

            try {
                await userDAO.getUserByRole(Role.CUSTOMER);
            } catch(e) {
                expect(e).toBe(error)
            }

            mockDBAll.mockRestore()
        })
    })

    describe("deleteUser tests:", () => {
        test("It should resolve true", async () => {
            const userDAO = new UserDAO()
            const row = {
                username: "username",
                name: "test",
                surname: "test"
            }
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, row)
                return {} as Database
            });
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null)
                return {} as Database
            });
            const result = await userDAO.deleteUser("username");
            expect(result).toBe(true)
            mockDBGet.mockRestore()
            mockDBRun.mockRestore()
        })

        test("It should reject Error", async () => {
            const userDAO = new UserDAO()
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(new Error)
                return {} as Database
            });
            const result = userDAO.deleteUser("username");
            await expect(result).rejects.toThrow(Error)
            mockDBGet.mockRestore()
        })

        test("It should reject Error", async () => {
            const userDAO = new UserDAO()
            const row = {
                username: "username",
                name: "test",
                surname: "test"
            }
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, row)
                return {} as Database
            });
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error())
                return {} as Database
            });
            const result = userDAO.deleteUser("username");
            await expect(result).rejects.toThrow(Error)
            mockDBGet.mockRestore()
            mockDBRun.mockRestore()
        })

        test("It should reject UserNotFoundError", async () => {
            const userDAO = new UserDAO()
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null)
                return {} as Database
            });
            const result = userDAO.deleteUser("username")
            await expect(result).rejects.toThrow(UserNotFoundError)
            mockDBGet.mockRestore()
        })

        test("It should reject error", async () => {
            const userDAO = new UserDAO()
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                throw error;
            });

            try {
                await userDAO.deleteUser("username")
            } catch(e) {
                expect(e).toBe(error)
            }

            mockDBGet.mockRestore()
        })
    })

    describe("deleteAll", () => {
        test("It should resolve true", async () => {
            const userDAO = new UserDAO()
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null)
                return {} as Database
            });
            const result = await userDAO.deleteAll();
            expect(result).toBe(true)
            mockDBRun.mockRestore()
        })

        test("It should reject Error", async () => {
            const userDAO = new UserDAO()
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Error"))
                return {} as Database
            });
            const result = userDAO.deleteAll();
            await expect(result).rejects.toThrow(Error)
            mockDBRun.mockRestore()
        })

        test("It should reject error", async () => {
            const userDAO = new UserDAO()
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                throw error;
            });

            try {
                await userDAO.deleteAll();
            } catch(e) {
                expect(e).toBe(error)
            }

            mockDBRun.mockRestore()
        })
    })

    describe("isAdminByUsername tests:", () => {
        test("It should resolve true", async () => {
            const userDAO = new UserDAO()
            const row = new User("username", "name", "surnamme", Role.ADMIN, "address", "birthdate");
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null,!!row)
                return {} as Database
            });
            const result = await userDAO.isAdminByUsername("username");
            expect(result).toBe(true)
            mockDBGet.mockRestore()
        })

        test("It should reject Error", async () => {
            const userDAO = new UserDAO()
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(new Error("Error"))
                return {} as Database
            });
            const result = userDAO.isAdminByUsername("username");
            await expect(result).rejects.toThrow(Error)
            mockDBGet.mockRestore()
        })

        test("It should reject error", async () => {
            const userDAO = new UserDAO()
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                throw error;
            });

            try {
                await userDAO.isAdminByUsername("username");
            } catch(e) {
                expect(e).toBe(error)
            }

            mockDBGet.mockRestore()
        })
    })

    describe("updateUserInformation tests:", () => {
        test("It should resolve user", async () => {
            const userDAO = new UserDAO()
            const row = {
                username: "test",
                name: "test",
                surname: "test",
                role: "Customer",
                address: "test",
                birthdate: "test"
            }
            const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, row)
                return {} as Database
            });
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null, user)
                return {} as Database
            });
            const result = userDAO.updateUserInformation("name", "surname", "address", "birthdate", "username");
            await expect(result).resolves.toStrictEqual(user);
            mockDBRun.mockRestore()
            mockDBGet.mockRestore()
        })

        test("It should reject Error", async () => {
            const userDAO = new UserDAO()
            const row = {
                username: "test",
                name: "test",
                surname: "test",
                role: "Customer",
                address: "test",
                birthdate: "test"
            }
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, row)
                return {} as Database
            });
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(new Error("Error"))
                return {} as Database
            });
            const result = userDAO.updateUserInformation("name", "surname", "address", "birthdate", "username");
            await expect(result).rejects.toThrow(Error)
            mockDBGet.mockRestore()
            mockDBRun.mockRestore()
        })

        test("It should reject Error", async () => {
            const userDAO = new UserDAO()
            const row = {
                username: "test",
                name: "test",
                surname: "test",
                role: "Customer",
                address: "test",
                birthdate: "test"
            }
            const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
                callback(null, row)
                return {} as Database
            });
            const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(null)
                return {} as Database
            });

            const mockDBGet2 = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(new Error())
                return {} as Database
            });
            const result = userDAO.updateUserInformation("name", "surname", "address", "birthdate", "username");
            await expect(result).rejects.toThrow(Error)
            mockDBGet.mockRestore()
            mockDBRun.mockRestore()
            mockDBGet2.mockRestore()
        })

        test("It should reject Error", async () => {
            const userDAO = new UserDAO()
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(new Error("Error"))
                return {} as Database
            });
            const result = userDAO.updateUserInformation("name", "surname", "address", "birthdate", "username");
            await expect(result).rejects.toThrow(Error)
            mockDBGet.mockRestore()
        })

        test("It should reject UserNotFoundError", async () => {
            const userDAO = new UserDAO()
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null)
                return {} as Database
            });
            const result = userDAO.updateUserInformation("name", "surname", "address", "birthdate", "username");
            await expect(result).rejects.toThrow(UserNotFoundError)
            mockDBGet.mockRestore()
        })

        test("It should reject error", async () => {
            const userDAO = new UserDAO()
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                throw error;
            });

            try {
                await userDAO.updateUserInformation("name", "surname", "address", "birthdate", "username");
            } catch(e) {
                expect(e).toBe(error)
            }

            mockDBGet.mockRestore()
        })
    })
})

import { test, expect, jest, describe, afterEach } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import ErrorHandler from "../../src/helper"
import Authenticator from "../../src/routers/auth"
import { Role, User } from "../../src/components/user"

import UserController from "../../src/controllers/userController"
import { InvalidDateError, UnauthorizedUserError, UserAlreadyExistsError, UserIsAdminError, UserNotFoundError } from "../../src/errors/userError"
const baseURL = "/ezelectronics"

jest.mock("../../src/controllers/userController")
jest.mock("../../src/routers/auth")

let testAdmin = new User("admin", "admin", "admin", Role.ADMIN, "", "")
let testCustomer = new User("customer", "customer", "customer", Role.CUSTOMER, "", "")

afterEach (() => {
    jest.clearAllMocks();
});

describe("Route unit tests:", () => {
    describe("POST ezelectronics/users", () => {
        test("It should return a 200 success code", async () => {
            const inputUser = { username: "test", name: "test", surname: "test", password: "test", role: "Manager" }
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            jest.spyOn(UserController.prototype, "createUser").mockResolvedValueOnce(true)

            const response = await request(app).post(baseURL + "/users").send(inputUser)
            expect(response.status).toBe(200)
            expect(UserController.prototype.createUser).toHaveBeenCalled()
            expect(UserController.prototype.createUser).toHaveBeenCalledWith(inputUser.username, inputUser.name, inputUser.surname, inputUser.password, inputUser.role)
        })

        test("It should return UserAlreadyExistsError", async () => {
            const inputUser = { username: "test", name: "test", surname: "test", password: "test", role: "Manager" }
            jest.spyOn(UserController.prototype, "createUser").mockRejectedValueOnce(new UserAlreadyExistsError())

            const response = await request(app).post(baseURL + "/users").send(inputUser)
            expect(response.status).toBe(409)
            expect(UserController.prototype.createUser).toHaveBeenCalled()
            expect(UserController.prototype.createUser).toHaveBeenCalledWith(inputUser.username, inputUser.name, inputUser.surname, inputUser.password, inputUser.role)
        })
    })

    describe("GET ezelectronics/users", () => {
        test("It returns an array of users", async () => {
            jest.spyOn(UserController.prototype, "getUsers").mockResolvedValueOnce([testAdmin, testCustomer])
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).get(baseURL + "/users")
            expect(response.status).toBe(200)
            expect(UserController.prototype.getUsers).toHaveBeenCalled()
            expect(response.body).toEqual([testAdmin, testCustomer])
        })

        test("It should fail if the user is not an Admin", async () => {
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
            const response = await request(app).get(baseURL + "/users")
            expect(response.status).toBe(401)
        })

        test("It should return Error", async () => {
            jest.spyOn(UserController.prototype, "getUsers").mockRejectedValueOnce(new Error())
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).get(baseURL + "/users")
            expect(response.status).toBe(503)
        })
    })

    describe("GET ezelectronics/users/roles/:role", () => {
        test("It returns an array of users with a specific role", async () => {
            jest.spyOn(UserController.prototype, "getUsersByRole").mockResolvedValueOnce([testAdmin])
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    isIn: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            
            const response = await request(app).get(baseURL + "/users/roles/Admin")
            expect(response.status).toBe(200)
            expect(UserController.prototype.getUsersByRole).toHaveBeenCalled()
            expect(UserController.prototype.getUsersByRole).toHaveBeenCalledWith("Admin")
            expect(response.body).toEqual([testAdmin])
        })

        test("It should fail if the role is not valid", async () => {
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => {
                    throw new Error("Invalid value");
                }),
            }));
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return res.status(422).json({ error: "The parameters are not formatted properly\n\n" });
            })
            
            const response = await request(app).get(baseURL + "/users/roles/Invalid")
            expect(response.status).toBe(422)
        })

        test("It should fail if the user is not an Admin", async () => {
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
            const response = await request(app).get(baseURL + "/users/roles/Admin")
            expect(response.status).toBe(401)
        })

        test("It should return Error", async () => {
            jest.spyOn(UserController.prototype, "getUsersByRole").mockRejectedValueOnce(new Error())
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).get(baseURL + "/users/roles/Admin")
            expect(response.status).toBe(503)
        })
    })

    describe("GET ezelectronics/users/:username", () => {
        test("It returns the user", async () => {
            jest.spyOn(UserController.prototype, "getUserByUsername").mockResolvedValueOnce(testCustomer)
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testAdmin
                return next();
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            const response = await request(app).get(baseURL + "/users/customer")
            expect(response.status).toBe(200)
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalled()
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledWith(testAdmin, "customer")
            expect(response.body).toEqual(testCustomer)
        })

        test("It should fail if the user is not a logged in user", async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
            const response = await request(app).get(baseURL + "/users/customer")
            expect(response.status).toBe(401)
        })

        test("It should return UserNotFoundError", async () => {
            jest.spyOn(UserController.prototype, "getUserByUsername").mockRejectedValueOnce(new UserNotFoundError())
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testAdmin
                return next();
            })

            const response = await request(app).get(baseURL + "/users/customer")
            expect(response.status).toBe(404)
            
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalled()
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledWith(testAdmin, "customer")
        })

        test("It should return UnauthorizedUserError", async () => {
            jest.spyOn(UserController.prototype, "getUserByUsername").mockRejectedValueOnce(new UnauthorizedUserError())
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testCustomer
                return next();
            })

            const response = await request(app).get(baseURL + "/users/customer1")
            expect(response.status).toBe(401)
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalled()
            expect(UserController.prototype.getUserByUsername).toHaveBeenCalledWith(testCustomer, "customer1")
        })
    })

    describe("DELETE ezelectronics/users/:username", () => {
        test("It should return a 200 success code", async () => {
            jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValueOnce(true)
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testAdmin
                return next();
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })

            const response = await request(app).delete(baseURL + "/users/customer")
            expect(response.status).toBe(200)
            expect(UserController.prototype.deleteUser).toHaveBeenCalled()
            expect(UserController.prototype.deleteUser).toHaveBeenCalledWith(testAdmin, "customer")
        })

        test("It should fail if the user is not a logged in user", async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
            const response = await request(app).delete(baseURL + "/users/customer")
            expect(response.status).toBe(401)
        })

        test("It should return UserNotFoundError", async () => {
            jest.spyOn(UserController.prototype, "deleteUser").mockRejectedValueOnce(new UserNotFoundError())
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testAdmin
                return next();
            })

            const response = await request(app).delete(baseURL + "/users/customer")
            expect(response.status).toBe(404)
            expect(UserController.prototype.deleteUser).toHaveBeenCalled()
            expect(UserController.prototype.deleteUser).toHaveBeenCalledWith(testAdmin, "customer")
        })

        test("It should return UnauthorizedUserError", async () => {
            jest.spyOn(UserController.prototype, "deleteUser").mockRejectedValueOnce(new UnauthorizedUserError())
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testAdmin
                return next();
            })

            const response = await request(app).delete(baseURL + "/users/customer")
            expect(response.status).toBe(401)
            expect(UserController.prototype.deleteUser).toHaveBeenCalled()
            expect(UserController.prototype.deleteUser).toHaveBeenCalledWith(testAdmin, "customer")
        })

        test("It should return UserIsAdminError", async () => {
            jest.spyOn(UserController.prototype, "deleteUser").mockRejectedValueOnce(new UserIsAdminError())

            const response = await request(app).delete(baseURL + "/users/customer")
            expect(response.status).toBe(401)
            expect(UserController.prototype.deleteUser).toHaveBeenCalled()
            expect(UserController.prototype.deleteUser).toHaveBeenCalledWith(testAdmin, "customer")
        })

    })

    describe("DELETE ezelectronics/users", () => {
        test("It should return a 200 success code", async () => {
            jest.spyOn(UserController.prototype, "deleteAll").mockResolvedValueOnce(true)
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            })
            const response = await request(app).delete(baseURL + "/users")
            expect(response.status).toBe(200)
            expect(UserController.prototype.deleteAll).toHaveBeenCalled()
        })

        test("It should fail if the user is not an Admin", async () => {
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
            const response = await request(app).get(baseURL + "/users")
            expect(response.status).toBe(401)
        })

        test("It should return Error", async () => {
            jest.spyOn(UserController.prototype, "deleteAll").mockRejectedValueOnce(new Error())
            jest.spyOn(Authenticator.prototype, "isAdmin").mockImplementation((req, res, next) => {
                return next();
            })

            const response = await request(app).delete(baseURL + "/users")
            expect(response.status).toBe(503)
        })
    })

    describe("PATCH ezelectronics/users/:username", () => {
        test("It returns user", async () => {
            let modifiedCustomer = new User("customer", "customer1", "customer", Role.CUSTOMER, "", "")
            let modCust = {
                username: "customer",
                name: "customer1",
                surname: "customer",
                address: "test",
                birthdate: "2000-12-14"
            }
            jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce(modifiedCustomer)
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testCustomer
                return next();
            })
            jest.mock('express-validator', () => ({
                param: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                    matches: () => ({ withMessage: () => ({}) }),
                })),
            }))
            jest.spyOn(ErrorHandler.prototype, "validateRequest").mockImplementation((req, res, next) => {
                return next()
            })
            const response = await request(app).patch(baseURL + "/users/customer").send(modCust)
            expect(response.status).toBe(200)
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalled()
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalledWith(testCustomer, "customer1", "customer", "test", "2000-12-14", "customer")
            expect(response.body).toEqual(modifiedCustomer)
        })

        test("It should fail if the user is not a logged in user", async () => {
            let modCust = {
                username: "customer",
                name: "customer",
                surname: "customer",
                address: "test",
                birthdate: "2000-12-14"
            }

            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
            const response = await request(app).patch(baseURL + "/users/customer").send(modCust)
            expect(response.status).toBe(401)
        })

        test("It should return UserIsAdminError", async () => {
            let modAdmin = {
                username: "admin2",
                name: "admin",
                surname: "admin",
                address: "test",
                birthdate: "2000-12-14"
            }
            jest.spyOn(UserController.prototype, "updateUserInfo").mockRejectedValueOnce(new UserIsAdminError())
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testAdmin
                return next();
            })

            const response = await request(app).patch(baseURL + "/users/admin2").send(modAdmin)
            expect(response.status).toBe(401)
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalled()
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalledWith(testAdmin, "admin", "admin", "test", "2000-12-14", "admin2")
        })

        test("It should return UnauthorizedUserError", async () => {
            let modCust = {
                username: "customer2",
                name: "customer",
                surname: "customer",
                address: "test",
                birthdate: "2000-12-14"
            }
            jest.spyOn(UserController.prototype, "updateUserInfo").mockRejectedValueOnce(new UnauthorizedUserError())
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testCustomer
                return next();
            })

            const response = await request(app).patch(baseURL + "/users/customer2").send(modCust)
            expect(response.status).toBe(401)
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalled()
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalledWith(testCustomer, "customer", "customer", "test", "2000-12-14", "customer2")
        })

        test("It should return InvalidDateError", async () => {
            let modCust = {
                username: "customer",
                name: "customer",
                surname: "customer",
                address: "test",
                birthdate: "2024-09-19"
            }
            jest.spyOn(UserController.prototype, "updateUserInfo").mockRejectedValueOnce(new InvalidDateError())
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testCustomer
                return next();
            })

            const response = await request(app).patch(baseURL + "/users/customer").send(modCust)
            expect(response.status).toBe(400)
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalled()
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalledWith(testCustomer, "customer", "customer", "test", "2024-09-19", "customer")
        })

        test("It should return UserNotFoundError", async () => {
            let modCust = {
                username: "customer",
                name: "customer",
                surname: "customer",
                address: "test",
                birthdate: "2000-12-14"
            }
            jest.spyOn(UserController.prototype, "updateUserInfo").mockRejectedValueOnce(new UserNotFoundError())
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testAdmin
                return next();
            })

            const response = await request(app).patch(baseURL + "/users/customer").send(modCust)
            expect(response.status).toBe(404)
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalled()
            expect(UserController.prototype.updateUserInfo).toHaveBeenCalledWith(testAdmin, "customer", "customer", "test", "2000-12-14", "customer")
        })
    })

    describe("POST ezelectronics/sessions", () => {
        test("It returns the logged in user", async () => {
            jest.spyOn(Authenticator.prototype, "login").mockResolvedValueOnce(testAdmin)
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
            }))

            const response = await request(app).post(baseURL + "/sessions").send(testAdmin)
            expect(response.status).toBe(200)
            expect(Authenticator.prototype.login).toHaveBeenCalled()
        })

        test("It should return UserNotFoundError", async () => {
            jest.spyOn(Authenticator.prototype, "login").mockRejectedValueOnce(new Error)
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
            }))

            const response = await request(app).post(baseURL + "/sessions").send(testAdmin)
            expect(response.status).toBe(401)
            expect(Authenticator.prototype.login).toHaveBeenCalled()
        })

        test("The password provided does not match the one in the database", async () => {
            jest.spyOn(Authenticator.prototype, "login").mockRejectedValueOnce(new Error)
            jest.mock('express-validator', () => ({
                body: jest.fn().mockImplementation(() => ({
                    isString: () => ({ isLength: () => ({}) }),
                })),
            }))

            const response = await request(app).post(baseURL + "/sessions").send(testAdmin)
            expect(response.status).toBe(401)
            expect(Authenticator.prototype.login).toHaveBeenCalled()
        })
    })

    describe("DELETE ezelectronics/sessions/current", () => {
        test("It returns a 200 status code", async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "logout").mockResolvedValueOnce(null)

            const response = await request(app).delete(baseURL + "/sessions/current")
            expect(response.status).toBe(200)
            expect(Authenticator.prototype.logout).toHaveBeenCalled()
        })

        test("It should return Error", async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return next();
            })
            jest.spyOn(Authenticator.prototype, "logout").mockRejectedValueOnce(new Error())

            const response = await request(app).delete(baseURL + "/sessions/current")
            expect(response.status).toBe(503)
        })
    })

    describe("GET ezelectronics/sessions/current", () => {
        test("It returns the logged in user", async () => {
            jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                req.user = testCustomer
                return next();
            })
            const response = await request(app).get(baseURL + "/sessions/current")
            expect(response.status).toBe(200)
            expect(response.body).toEqual(testCustomer)
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalled()
        })
    })
})
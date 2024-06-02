import { test, expect, jest, describe, afterEach } from "@jest/globals"
import UserController from "../../src/controllers/userController"
import UserDAO from "../../src/dao/userDAO"
import { Role, User } from "../../src/components/user";
import { UnauthorizedUserError, UserIsAdminError, InvalidDateError } from "../../src/errors/userError";


jest.mock("../../src/dao/userDAO")

describe("Controller unit tests:", () => {

    afterEach (() => {
        jest.clearAllMocks();
    });

    describe("createUser tests:", () => {
        //Example of a unit test for the createUser method of the UserController
        //The test checks if the method returns true when the DAO method returns true
        //The test also expects the DAO method to be called once with the correct parameters

        test("It should return true", async () => {
            const testUser = { //Define a test user object
                username: "test",
                name: "test",
                surname: "test",
                password: "test",
                role: "Manager"
            }
            jest.spyOn(UserDAO.prototype, "createUser").mockResolvedValueOnce(true); //Mock the createUser method of the DAO
            const controller = new UserController(); //Create a new instance of the controller
            //Call the createUser method of the controller with the test user object
            const response = await controller.createUser(testUser.username, testUser.name, testUser.surname, testUser.password, testUser.role);

            //Check if the createUser method of the DAO has been called once with the correct parameters
            expect(UserDAO.prototype.createUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.createUser).toHaveBeenCalledWith(testUser.username,
                testUser.name,
                testUser.surname,
                testUser.password,
                testUser.role);
            expect(response).toBe(true); //Check if the response is true
        });
    })

    describe("getUsers tests:", () => {
        //Unit test for the getUsers method of the UserController
        //The test checks if the method returns user[] when the DAO method returns user[]

        test("It should return user[]", async () => {
            const user1 = new User("test1", "test", "test", Role.MANAGER, "test", "test");
            const user2 = new User("test2", "test", "test", Role.CUSTOMER, "test", "test");
            const users = [user1, user2];

            jest.spyOn(UserDAO.prototype, "getUser").mockResolvedValue(users);
            const controller = new UserController();
            const response = await controller.getUsers();

            expect(UserDAO.prototype.getUser).toHaveBeenCalledTimes(1);
            expect(response).toBe(users);
        });
    })

    describe("getUsersByRole tests:", () => {
        //Unit test for the getUsersByRole method of the UserController
        //The test checks if the method returns user[] when the DAO method returns user[]

        test("It should return user[]", async () => {
            const testRole = Role.CUSTOMER;
            
            const user1 = new User("test1", "test", "test", Role.CUSTOMER, "test", "test");
            const user2 = new User("test2", "test", "test", Role.CUSTOMER, "test", "test");
            const users: User[] = [user1, user2];

            jest.spyOn(UserDAO.prototype, "getUserByRole").mockResolvedValue(users);
            const controller = new UserController();
            const response = await controller.getUsersByRole(testRole);

            expect(UserDAO.prototype.getUserByRole).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByRole).toHaveBeenCalledWith(testRole);
            expect(response).toBe(users);
        });
    })

    describe("getUserByUsername tests:", () => {
        //Unit test for the getUserByUsername method of the UserController
        //The test checks if the method returns user when the DAO method returns user
        //The testUser is a customer that wants its own information

        test("It should return user:", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
            const testUsername = "test";
            const user = new User("test", "test", "test", Role.CUSTOMER, "test", "test");

            jest.spyOn(UserDAO.prototype, "getUserByUsername").mockResolvedValue(user);
            const controller = new UserController();
            const response = await controller.getUserByUsername(testUser, testUsername);

            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.getUserByUsername).toHaveBeenCalledWith(testUsername);
            expect(response).toBe(user);
        });

        //Unit test for the getUserByUsername method of the UserController
        //The test checks if the method returns UnauthorizedUserError
        //The testUser is a customer that wants another user informations

        test("It should return UnauthorizedUserError", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
            const testUsername = "test1";

            const controller = new UserController();
            const response = controller.getUserByUsername(testUser, testUsername);
            
            await expect(response).rejects.toThrow(UnauthorizedUserError);
        });
    })

    describe("deleteUser tests:", () => {
        //Unit test for the deleteUser method of the UserController
        //The test checks if the method returns true when the DAO method returns true
        //The testUser is a client that wants to delete its own account

        test("It should return true", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
            const testUsername = "test";

            jest.spyOn(UserDAO.prototype, "deleteUser").mockResolvedValueOnce(true);
            const controller = new UserController();
            const response = await controller.deleteUser(testUser, testUsername);

            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteUser).toHaveBeenCalledWith(testUsername);
            expect(response).toBe(true);
        })

        //Unit test for the deleteUser method of the UserController
        //The test checks if the method returns true when the DAO method returns UnauthorizedUserError
        //The testUser is a client that wants to delete another user account

        test("It should return UnauthorizedUserError", async () => {
            const testUser = new User("test", "test", "test", Role.CUSTOMER, "test", "test");
            const testUsername = "test1";

            const controller = new UserController();
            const response = controller.deleteUser(testUser, testUsername);

            await expect(response).rejects.toThrow(UnauthorizedUserError);
        })

        //Unit test for the deleteUser method of the UserController
        //The test checks if the method returns true when the DAO method returns UserIsAdminError
        //The testUser is an admin that wants to delete another user (admin) account

        test("It should return UserIsAdminError", async () => {
            const testUser = new User("test", "test", "test", Role.ADMIN, "test", "test");
            const testUsername = "test1";

            jest.spyOn(UserDAO.prototype, "isAdminByUsername").mockResolvedValueOnce(true);
            const controller = new UserController();
            const response = controller.deleteUser(testUser, testUsername);

            expect(UserDAO.prototype.isAdminByUsername).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.isAdminByUsername).toHaveBeenCalledWith(testUsername);
            await expect(response).rejects.toThrow(UserIsAdminError);
        })
    })

    describe("deleteAll tests:", () => {
        //Unit test for the deleteAll method of the UserController
        //The test checks if the method returns true when the DAO method returns true

        test("deleteAll should return true", async () => {

            jest.spyOn(UserDAO.prototype, "deleteAll").mockResolvedValueOnce(true);
            const controller = new UserController();
            const response = await controller.deleteAll();

            expect(UserDAO.prototype.deleteAll).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.deleteAll).toHaveBeenCalledWith();
            expect(response).toBe(true);
        })
    })

    describe("updateUserInfo tests:", () => {
        //Unit test for the updateUserInfo method of the UserController
        //The test checks if the method returns user when the DAO method returns InvalidDateError
        //The testUser is an Admin

        test("It should return InvalidDateError", async () => {
            const testUser = {
                name: "test",
                surname: "test",
                address: "test",
                birthdate: "2025-01-14",
                username: "test1"
            }
            const testUser_ = new User("test", "test", "test", Role.ADMIN, "test", "test")

            const controller = new UserController();
            const response = controller.updateUserInfo(testUser_, testUser.name, testUser.surname, testUser.address, testUser.birthdate, testUser.username);

            await expect(response).rejects.toThrow(InvalidDateError);
        })

        //Unit test for the updateUserInfo method of the UserController
        //The test checks if the method returns user when the DAO method returns UnauthorizedUserError
        //The testUser is an Custumer that wants to modify another user information

        test("It should return UnauthorizedUserError", async () => {
            const testUser = {
                name: "test",
                surname: "test",
                address: "test",
                birthdate: "test",
                username: "test1"
            }
            const testUser_ = new User("test", "test", "test", Role.CUSTOMER, "test", "test")

            const controller = new UserController();
            const response = controller.updateUserInfo(testUser_, testUser.name, testUser.surname, testUser.address, testUser.birthdate, testUser.username);

            await expect(response).rejects.toThrow(UnauthorizedUserError);
        })

        //Unit test for the updateUserInfo method of the UserController
        //The test checks if the method returns user when the DAO method returns user
        //The testUser is an Admin

        test("It should return true", async () => {
            const testUser = {
                name: "test",
                surname: "test",
                address: "test",
                birthdate: "test",
                username: "test1"
            }
            const testUser_ = new User("test", "test", "test", Role.ADMIN, "test", "test")
            const user = new User("test1", "test", "test", Role.ADMIN, "test", "test")

            jest.spyOn(UserDAO.prototype, "updateUserInformation").mockResolvedValueOnce(user);
            const controller = new UserController();
            const response = await controller.updateUserInfo(testUser_, testUser.name, testUser.surname, testUser.address, testUser.birthdate, testUser.username);
            
            expect(UserDAO.prototype.updateUserInformation).toHaveBeenCalledTimes(1);
            expect(UserDAO.prototype.updateUserInformation).toHaveBeenCalledWith(testUser.name, testUser.surname, testUser.address, testUser.birthdate, testUser.username);
            expect(response).toBe(user);
        })
    })

});
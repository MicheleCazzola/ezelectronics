import { describe, test, expect, beforeAll, afterAll, afterEach, beforeEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import db from "../../src/db/db"
import { cleanup } from "../../src/db/cleanup_custom"
import { Role, User } from "../../src/components/user"
import UserDAO from "../../src/dao/userDAO"
import { InvalidDateError, UnauthorizedUserError, UserAlreadyExistsError, UserIsAdminError, UserNotFoundError } from "../../src/errors/userError"
import { Database } from "sqlite3"
import UserController from "../../src/controllers/userController"

let controller = new UserController()

beforeAll(async () => {
    await cleanup();
});

afterEach(async () => {
    await cleanup();
});

const user1 = {
    username: "user1",
    name: "first",
    surname: "user",
    password: "password",
    role: "Customer",
}

const user2 = {
    username: "user2",
    name: "second",
    surname: "user",
    password: "password",
    role: "Admin",
}

const user3 = {
    username: "user3",
    name: "third",
    surname: "user",
    password: "password",
    role: "Customer",
}

const user4 = {
    username: "user4",
    name: "fourth",
    surname: "user",
    password: "password",
    role: "Admin",
}

const firstUser = new User(user1.username, user1.name, user1.surname, Role.CUSTOMER, "", "")
const secondUser = new User(user2.username, user2.name, user2.surname, Role.ADMIN, "", "")
const thirdUser = new User(user3.username, user3.name, user3.surname, Role.CUSTOMER, "", "")
const fourthUser = new User(user4.username, user4.name, user4.surname, Role.CUSTOMER, "", "")
const firstModUser = new User(user1.username, "First", "User", Role.CUSTOMER, "", "")
const users = [firstUser, secondUser]
const custUsers = [firstUser, thirdUser]
const noUsers: User[] = []

describe("User Controller integration tests:", () => {
    describe("createUser tests:", () => {
        test("It should resolve true", async () => {
            const result = await controller.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            expect(result).toBe(true)
            const check = await controller.getUserByUsername(firstUser,user1.username)
            expect(check.username).toBe(firstUser.username)
            expect(check.name).toBe(firstUser.name)
            expect(check.surname).toBe(firstUser.surname)
            expect(check.role).toBe(firstUser.role)
            expect(check.address).toBe(null)
            expect(check.birthdate).toBe(null)
        })

        test("It should return a UserAlreadyExistsError", async () => {
            await controller.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            const result = controller.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            await expect(result).rejects.toThrow(UserAlreadyExistsError)
        })
    })

    describe("getUsers tests:", () => {
        test("It should resolve users[]", async () => {
            await controller.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            await controller.createUser(user2.username, user2.name, user2.surname, user2.password, user2.role)
            const result = await controller.getUsers()

            expect(result[0].username).toBe(users[0].username)
            expect(result[0].name).toBe(users[0].name)
            expect(result[0].surname).toBe(users[0].surname)
            expect(result[0].role).toBe(users[0].role)
            expect(result[0].address).toBe(null)
            expect(result[0].birthdate).toBe(null)

            expect(result[1].username).toBe(users[1].username)
            expect(result[1].name).toBe(users[1].name)
            expect(result[1].surname).toBe(users[1].surname)
            expect(result[1].role).toBe(users[1].role)
            expect(result[1].address).toBe(null)
            expect(result[1].birthdate).toBe(null)
        })
    })

    describe("getUsersByRole tests:", () => {
        test("It should resolve users[]", async () => {
            await controller.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            await controller.createUser(user2.username, user2.name, user2.surname, user2.password, user2.role)
            await controller.createUser(user3.username, user3.name, user3.surname, user3.password, user3.role)
            const result = await controller.getUsersByRole("Customer")

            expect(result[0].username).toBe(custUsers[0].username)
            expect(result[0].name).toBe(custUsers[0].name)
            expect(result[0].surname).toBe(custUsers[0].surname)
            expect(result[0].role).toBe(custUsers[0].role)
            expect(result[0].address).toBe(null)
            expect(result[0].birthdate).toBe(null)

            expect(result[1].username).toBe(custUsers[1].username)
            expect(result[1].name).toBe(custUsers[1].name)
            expect(result[1].surname).toBe(custUsers[1].surname)
            expect(result[1].role).toBe(custUsers[1].role)
            expect(result[1].address).toBe(null)
            expect(result[1].birthdate).toBe(null)
        })
    })

    describe("getUserByUsername tests:", () => {
        test("It should resolve the user", async () => {
            await controller.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            const result = await controller.getUserByUsername(firstUser, user1.username)
            expect(result.username).toBe(firstUser.username)
            expect(result.name).toBe(firstUser.name)
            expect(result.surname).toBe(firstUser.surname)
            expect(result.role).toBe(firstUser.role)
            expect(result.address).toBe(null)
            expect(result.birthdate).toBe(null)
        })

        test("It should return UserNotFoundError", async () => {
            const result = controller.getUserByUsername(firstUser, user1.username)
            await expect(result).rejects.toThrow(UserNotFoundError)
        })

        test("It should return UnauthorizedUserError", async () => {
            await controller.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            const result = controller.getUserByUsername(thirdUser, user1.username)
            await expect(result).rejects.toThrow(UnauthorizedUserError)
        })
    })

    describe("deleteUser tests:", () => {
        test("It should resolve true", async () => {
            await controller.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            await controller.createUser(user2.username, user2.name, user2.surname, user2.password, user2.role)
            await controller.createUser(user3.username, user3.name, user3.surname, user3.password, user3.role)
            const result = await controller.deleteUser(thirdUser, user3.username)
            expect(result).toBe(true)
            const check = await controller.getUsers()

            expect(check[0].username).toBe(users[0].username)
            expect(check[0].name).toBe(users[0].name)
            expect(check[0].surname).toBe(users[0].surname)
            expect(check[0].role).toBe(users[0].role)
            expect(check[0].address).toBe(null)
            expect(check[0].birthdate).toBe(null)

            expect(check[1].username).toBe(users[1].username)
            expect(check[1].name).toBe(users[1].name)
            expect(check[1].surname).toBe(users[1].surname)
            expect(check[1].role).toBe(users[1].role)
            expect(check[1].address).toBe(null)
            expect(check[1].birthdate).toBe(null)
        })

        test("It should return UserNotFoundError", async () => {
            const result = controller.deleteUser(firstUser, user1.username)
            await expect(result).rejects.toThrow(UserNotFoundError)
        })

        test("It should return UnauthorizedUserError", async () => {
            await controller.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            await controller.createUser(user2.username, user2.name, user2.surname, user2.password, user2.role)
            const result = controller.deleteUser(firstUser, user2.username)
            await expect(result).rejects.toThrow(UnauthorizedUserError)
        })

        test("It should return UserIsAdminError", async () => {
            await controller.createUser(user2.username, user2.name, user2.surname, user2.password, user2.role)
            await controller.createUser(user4.username, user4.name, user4.surname, user4.password, user4.role)
            const result = controller.deleteUser(secondUser, user4.username)
            await expect(result).rejects.toThrow(UserIsAdminError)
        })
    })

    describe("deleteAll tests:", () => {
        test("It should resolve true", async () => {
            await controller.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            await controller.createUser(user2.username, user2.name, user2.surname, user2.password, user2.role)
            const result = await controller.deleteAll()
            expect(result).toBe(true)
            const check = await controller.getUsers()
            //await expect(check).resolves.toStrictEqual(noUsers)
            expect(check[0].username).toBe(secondUser.username)
            expect(check[0].name).toBe(secondUser.name)
            expect(check[0].surname).toBe(secondUser.surname)
            expect(check[0].role).toBe(secondUser.role)
            expect(check[0].address).toBe(null)
            expect(check[0].birthdate).toBe(null)
        })
    })

    describe("updateUserInformation tests:", () => {
        test("It should resolve user", async () => {
            await controller.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            const result = await controller.updateUserInfo(firstUser, "First", "User", "", "", user1.username)

            expect(result.username).toBe(firstModUser.username)
            expect(result.name).toBe(firstModUser.name)
            expect(result.surname).toBe(firstModUser.surname)
            expect(result.role).toBe(firstModUser.role)
            expect(result.address).toBe("")
            expect(result.birthdate).toBe("")
        })

        test("It should return UserNotFoundError", async () => {
            const result = controller.updateUserInfo(firstUser, "First", "User", "", "", user1.username)
            await expect(result).rejects.toThrow(UserNotFoundError)
        })

        test("It should return InvalidDateError", async () => {
            await controller.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            const result = controller.updateUserInfo(firstUser, "First", "User", "", "2025-12-15", user1.username)
            await expect(result).rejects.toThrow(InvalidDateError)
        })

        test("It should return UnauthorizedUserError", async () => {
            await controller.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            await controller.createUser(user2.username, user2.name, user2.surname, user2.password, user2.role)
            const result = controller.updateUserInfo(firstUser, "Second", "User", "", "", user2.username)
            await expect(result).rejects.toThrow(UnauthorizedUserError)
        })
    })
})
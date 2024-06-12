import { describe, test, expect, beforeAll, afterAll, afterEach, beforeEach, jest } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import db from "../../src/db/db"
import { cleanup } from "../../src/db/cleanup_custom"
import { Role, User } from "../../src/components/user"
import UserDAO from "../../src/dao/userDAO"
import { UserAlreadyExistsError, UserNotFoundError } from "../../src/errors/userError"
import { Database } from "sqlite3"

let dao = new UserDAO();

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

const firstUser = new User(user1.username, user1.name, user1.surname, Role.CUSTOMER, "", "")
const secondUser = new User(user2.username, user2.name, user2.surname, Role.ADMIN, "", "")
const thirdUser = new User(user3.username, user3.name, user3.surname, Role.CUSTOMER, "", "")
const firstModUser = new User(user1.username, "First", "User", Role.CUSTOMER, "", "")
const users = [firstUser, secondUser]
const custUsers = [firstUser, thirdUser]
const noUsers: User[] = []


describe("User DAO integration tests:", () => {
    describe("getIsUserAuthenticated tests:", () => {
        test("It should resolve true", async () => {
            await dao.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            const result = await dao.getIsUserAuthenticated(user1.username, user1.password)
            expect(result).toBe(true)
        })

        test("It should resolve false", async () => {
            await dao.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            const result = await dao.getIsUserAuthenticated("user", "test")
            expect(result).toBe(false)
        })
    })

    describe("createUser tests:", () => {
        test("It should resolve true", async () => {
            const result = await dao.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            expect(result).toBe(true)
            const check = await dao.getUserByUsername(user1.username)
            expect(check.username).toBe(firstUser.username)
            expect(check.name).toBe(firstUser.name)
            expect(check.surname).toBe(firstUser.surname)
            expect(check.role).toBe(firstUser.role)
            expect(check.address).toBe(null)
            expect(check.birthdate).toBe(null)
        })

        test("It should return a UserAlreadyExistsError", async () => {
            await dao.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            const result = dao.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            await expect(result).rejects.toThrow(UserAlreadyExistsError)
        })
    })

    describe("getUserByUsername tests:", () => {
        test("It should resolve the user", async () => {
            await dao.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            const result = await dao.getUserByUsername(user1.username)
            expect(result.username).toBe(firstUser.username)
            expect(result.name).toBe(firstUser.name)
            expect(result.surname).toBe(firstUser.surname)
            expect(result.role).toBe(firstUser.role)
            expect(result.address).toBe(null)
            expect(result.birthdate).toBe(null)
        })

        test("It should return UserNotFoundError", async () => {
            const result = dao.getUserByUsername(user1.username)
            await expect(result).rejects.toThrow(UserNotFoundError)
        })
    })

    describe("getUser tests:", () => {
        test("It should resolve users[]", async () => {
            await dao.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            await dao.createUser(user2.username, user2.name, user2.surname, user2.password, user2.role)
            const result = await  dao.getUser()

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

    describe("getUserByRole tests:", () => {
        test("It should resolve users[]", async () => {
            await dao.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            await dao.createUser(user2.username, user2.name, user2.surname, user2.password, user2.role)
            await dao.createUser(user3.username, user3.name, user3.surname, user3.password, user3.role)
            const result = await dao.getUserByRole("Customer")

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

    describe("deleteUser tests:", () => {
        test("It should resolve true", async () => {
            await dao.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            await dao.createUser(user2.username, user2.name, user2.surname, user2.password, user2.role)
            await dao.createUser(user3.username, user3.name, user3.surname, user3.password, user3.role)
            const result = await dao.deleteUser(user3.username)
            expect(result).toBe(true)
            const check = await dao.getUser()
            //await expect(check).resolves.toStrictEqual(users)
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
            const result = dao.deleteUser(user1.username)
            await expect(result).rejects.toThrow(UserNotFoundError)
        })
    })

    describe("deleteAll tests:", () => {
        test("It should resolve true", async () => {
            await dao.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            await dao.createUser(user2.username, user2.name, user2.surname, user2.password, user2.role)
            const result = await dao.deleteAll()
            expect(result).toBe(true)
            const check = dao.getUser()
            await expect(check).resolves.toStrictEqual(noUsers)
        })
    })

    describe("isAdminByUsername tests:", () => {
        test("It should resolve true", async () => {
            await dao.createUser(user2.username, user2.name, user2.surname, user2.password, user2.role)
            const result = await dao.isAdminByUsername(user2.username)
            expect(result).toBe(true)
        })

        test("It should resolve true", async () => {
            await dao.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            const result = await dao.isAdminByUsername(user1.username)
            expect(result).toBe(false)
        })
    })

    describe("updateUserInformation tests:", () => {
        test("It should resolve user", async () => {
            await dao.createUser(user1.username, user1.name, user1.surname, user1.password, user1.role)
            const result = await dao.updateUserInformation("First", "User", "", "", user1.username)

            const check = await dao.getUserByUsername(firstUser.username)
            expect(check.username).toBe(firstUser.username)

            expect(result.username).toBe(firstModUser.username)
            expect(result.name).toBe(firstModUser.name)
            expect(result.surname).toBe(firstModUser.surname)
            expect(result.role).toBe(firstModUser.role)
            expect(result.address).toBe("")
            expect(result.birthdate).toBe("")
        })

        test("It should return UserNotFoundError", async () => {
            const result = dao.updateUserInformation("First", "User", "", "", user1.username)
            await expect(result).rejects.toThrow(UserNotFoundError)
        })
    })
})
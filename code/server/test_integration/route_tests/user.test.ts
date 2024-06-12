import { describe, test, expect, beforeAll, afterAll, afterEach } from "@jest/globals"
import request from 'supertest'
import { app } from "../../index"
import { cleanup } from "../../src/db/cleanup_custom"
import UserDAO from "../../src/dao/userDAO"

const routePath = "/ezelectronics"

const customer = { username: "customer", name: "customer", surname: "customer", password: "customer", role: "Customer" }
const admin = { username: "admin", name: "admin", surname: "admin", password: "admin", role: "Admin" }
const admin2 = { username: "admin2", name: "admin", surname: "admin", password: "admin", role: "Admin" }

let customerCookie: string
let adminCookie: string

const postUser = async (userInfo: any) => {
    await request(app)
        .post(`${routePath}/users`)
        .send(userInfo)
        .expect(200)
}

const login = async (userInfo: any) => {
    return new Promise<string>((resolve, reject) => {
        request(app)
            .post(`${routePath}/sessions`)
            .send(userInfo)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                resolve(res.header["set-cookie"][0])
            })
    })
}

beforeAll(async () => {
    cleanup()
})

afterEach(async () => {
    await cleanup();
});

describe("User Route integration tests:", () => {
    describe("POST ezelectronics/users", () => {
        test("It should return a 200 success code and create a new user", async () => {
            await postUser(admin)
            adminCookie = await login(admin)

            await request(app)
                .post(`${routePath}/users`)
                .send(customer)
                .expect(200)

            const cust = await new UserDAO().getUserByUsername(customer.username)

            expect(cust).toBeDefined()
            expect(cust.name).toBe(customer.name)
            expect(cust.surname).toBe(customer.surname)
            expect(cust.role).toBe(customer.role)
        })

        test("It should return a 422 error code if at least one request body parameter is empty/missing", async () => {
            await postUser(admin)
            adminCookie = await login(admin)

            await request(app)
                .post(`${routePath}/users`)
                .send({ username: "", name: "test", surname: "test", password: "test", role: "Customer" })
                .expect(422)

            await request(app)
                .post(`${routePath}/users`)
                .send({ username: "test", name: "", surname: "test", password: "test", role: "Customer" })
                .expect(422)

            await request(app)
                .post(`${routePath}/users`)
                .send({ username: "test", name: "test", surname: "", password: "test", role: "Customer" })
                .expect(422)

            await request(app)
                .post(`${routePath}/users`)
                .send({ username: "test", name: "test", surname: "test", password: "", role: "Customer" })
                .expect(422)

            await request(app)
                .post(`${routePath}/users`)
                .send({ username: "test", name: "test", surname: "test", password: "test", role: "" })
                .expect(422)
        })

        test("It should return a 409 error code if we try to create two users with the same username", async () => {
            await postUser(admin)
            adminCookie = await login(admin)

            await request(app)
                .post(`${routePath}/users`)
                .send({ username: "admin", name: "test", surname: "test", password: "test", role: "Customer" })
                .expect(409)
        })
    })

    describe("GET ezelectronics/users", () => {
        test("It should return an array of users", async () => {
            await postUser(admin)
            await postUser(customer)
            adminCookie = await login(admin)

            const users = await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(users.body).toHaveLength(2)

            let cust = users.body.find((user: any) => user.username === customer.username)
            expect(cust).toBeDefined()
            expect(cust.name).toBe(customer.name)
            expect(cust.surname).toBe(customer.surname)
            expect(cust.role).toBe(customer.role)

            let adm = users.body.find((user: any) => user.username === admin.username)
            expect(adm).toBeDefined()
            expect(adm.name).toBe(admin.name)
            expect(adm.surname).toBe(admin.surname)
            expect(adm.role).toBe(admin.role)
        })

        test("It should return a 401 error code if the user is not an Admin", async () => {
            await postUser(admin)
            await postUser(customer)
            customerCookie = await login(customer)

            await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", customerCookie)
                .expect(401)

            await request(app)
                .get(`${routePath}/users`)
                .expect(401)
        })
    })

    describe("GET ezelectronics/users/roles/:role", () => {
        test("It should return an array of users with a specific role", async () => {
            await postUser(admin)
            await postUser(customer)
            adminCookie = await login(admin)

            const admins = await request(app)
                .get(`${routePath}/users/roles/Admin`)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(admins.body).toHaveLength(1)

            let adm = admins.body[0]
            expect(adm.username).toBe(admin.username)
            expect(adm.name).toBe(admin.name)
            expect(adm.surname).toBe(admin.surname)
        })

        test("It should fail if the role is not valid", async () => {
            await postUser(admin)
            await postUser(customer)
            adminCookie = await login(admin)

            await request(app).get(`${routePath}/users/roles/Invalid`).set("Cookie", adminCookie).expect(422)
        })

        test("It should return a 401 error code if the user is not an Admin", async () => {
            await postUser(admin)
            await postUser(customer)
            customerCookie = await login(customer)

            await request(app)
                .get(`${routePath}/users/roles/Admin`)
                .set("Cookie", customerCookie)
                .expect(401)

            await request(app)
                .get(`${routePath}/users/roles/Admin`)
                .expect(401)
        })
    })

    describe("GET ezelectronics/users/:username", () => {
        test("It should return a single user with the specified username", async () => {
            await postUser(admin)
            await postUser(customer)
            adminCookie = await login(admin)

            const cust = await request(app)
                .get(`${routePath}/users/customer`)
                .set("Cookie", adminCookie)
                .expect(200)

            let cms = cust.body
            expect(cms.username).toBe(customer.username)
            expect(cms.name).toBe(customer.name)
            expect(cms.surname).toBe(customer.surname)
        })

        test("It should return a 401 cose error if the user is not logged in", async () => {
            await postUser(admin)
            await postUser(customer)

            await request(app)
                .get(`${routePath}/users/customer`)
                .expect(401)
        })

        test("It should return a 404 error code if the username does not exist in the database", async () => {
            await postUser(admin)
            adminCookie = await login(admin)

            await request(app)
                .get(`${routePath}/users/customer`)
                .set("Cookie", adminCookie)
                .expect(404)
        })

        test("It should return a 401 error if username is not equal to the username of the logged user calling the route, and the user calling the route is not an Admin", async () => {
            await postUser(admin)
            await postUser(customer)
            customerCookie = await login(customer)

            await request(app)
                .get(`${routePath}/users/admin`)
                .set("Cookie", customerCookie)
                .expect(401)
        })
    })

    describe("DELETE ezelectronics/users/:username", () => {
        test("Deletes a specific user, identified by the username, from the database and returns a 200 status code", async () => {
            await postUser(admin)
            await postUser(customer)
            adminCookie = await login(admin)

            await request(app)
                .delete(`${routePath}/users/customer`)
                .set("Cookie", adminCookie)
                .expect(200)

            await request(app)
                .get(`${routePath}/users/customer`)
                .set("Cookie", adminCookie)
                .expect(404)
        })

        test("It should return a 401 cose error if the user is not logged in", async () => {
            await postUser(admin)
            await postUser(customer)

            await request(app)
                .delete(`${routePath}/users/customer`)
                .expect(401)
        })

        test("It should return a 404 error code if the username does not exist in the database", async () => {
            await postUser(admin)
            adminCookie = await login(admin)

            await request(app)
                .delete(`${routePath}/users/customer`)
                .set("Cookie", adminCookie)
                .expect(404)
        })

        test("It should return a 401 error if the username is not equal to the username of the logged user calling the route, and the user calling the route is not an Admin", async () => {
            await postUser(admin)
            await postUser(customer)
            customerCookie = await login(customer)

            await request(app)
                .delete(`${routePath}/users/admin`)
                .set("Cookie", customerCookie)
                .expect(401)
        })

        test("It should return a 401 error if the calling user is an Admin and username represents a different Admin user", async () => {
            await postUser(admin)
            await postUser(admin2)
            adminCookie = await login(admin)

            await request(app)
                .delete(`${routePath}/users/admin2`)
                .set("Cookie", adminCookie)
                .expect(401)
        })
    })

    describe("DELETE ezelectronics/users", () => {
        test("Deletes all non-Admin users from the database and returns a 200 status code", async () => {
            await postUser(admin)
            await postUser(customer)
            adminCookie = await login(admin)

            await request(app)
                .delete(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .expect(200)

            const admins = await request(app)
                .get(`${routePath}/users`)
                .set("Cookie", adminCookie)
                .expect(200)

            expect(admins.body).toHaveLength(1)

            let adm = admins.body[0]
            expect(adm.username).toBe(admin.username)
            expect(adm.name).toBe(admin.name)
            expect(adm.surname).toBe(admin.surname)

            await request(app)
                .get(`${routePath}/users/customer`)
                .set("Cookie", adminCookie)
                .expect(404)
        })

        test("It should return a 401 error code if the user is not an Admin", async () => {
            await postUser(admin)
            await postUser(customer)
            customerCookie = await login(customer)

            await request(app)
                .delete(`${routePath}/users`)
                .set("Cookie", customerCookie)
                .expect(401)

            await request(app)
                .delete(`${routePath}/users`)
                .expect(401)
        })
    })

    describe("PATCH ezelectronics/users/:username", () => {
        test("Updates the personal information of a single user, identified by the username and returns the updated user", async () => {
            await postUser(admin)
            await postUser(customer)
            adminCookie = await login(admin)

            const cust = await request(app)
                .patch(`${routePath}/users/customer`)
                .send({name: "test", surname: "test", address: "test", birthdate: "1995-02-27"})
                .set("Cookie", adminCookie)
                .expect(200)

            let cms = cust.body
            expect(cms.username).toBe(customer.username)
            expect(cms.name).toBe("test")
            expect(cms.surname).toBe("test")
        })

        test("It should return a 401 cose error if the user is not logged in", async () => {
            await postUser(admin)
            await postUser(customer)

            await request(app)
                .patch(`${routePath}/users/customer`)
                .send({name: "test", surname: "test", address: "test", birthdate: "1995-02-27"})
                .expect(401)
        })

        test("It should return a 404 error code if the username does not exist in the database", async () => {
            await postUser(admin)
            adminCookie = await login(admin)

            await request(app)
                .patch(`${routePath}/users/customer`)
                .send({name: "test", surname: "test", address: "test", birthdate: "1995-02-27"})
                .set("Cookie", adminCookie)
                .expect(404)
        })

        test("It should return a 401 error if the username does not correspond to the username of the logged in user", async () => {
            await postUser(admin)
            await postUser(customer)
            customerCookie = await login(customer)

            await request(app)
                .patch(`${routePath}/users/admin`)
                .send({name: "test", surname: "test", address: "test", birthdate: "1995-02-27"})
                .set("Cookie", customerCookie)
                .expect(401)
        })

        test("It should return a 401 error if an admin tries to update another admin info", async () => {
            await postUser(admin)
            await postUser(admin2)
            adminCookie = await login(admin)

            await request(app)
                .patch(`${routePath}/users/admin2`)
                .send({name: "test", surname: "test", address: "test", birthdate: "1995-02-27"})
                .set("Cookie", adminCookie)
                .expect(401)
        })

        test("It should return a 400 error if the birthdate is after the current date", async () => {
            await postUser(admin)
            adminCookie = await login(admin)

            await request(app)
                .patch(`${routePath}/users/admin`)
                .send({name: "test", surname: "test", address: "test", birthdate: "2025-02-27"})
                .set("Cookie", adminCookie)
                .expect(400)
        })

        test("It should return a 422 error code if at least one request body parameter is empty/missing", async () => {
            await postUser(admin)
            adminCookie = await login(admin)

            await request(app)
                .patch(`${routePath}/users/customer`)
                .send({name: "", surname: "test", address: "test", birthdate: "1994-02-27"})
                .set("Cookie", adminCookie)
                .expect(422)

            await request(app)
                .patch(`${routePath}/users/customer`)
                .send({name: "test", surname: "", address: "test", birthdate: "1994-02-27"})
                .set("Cookie", adminCookie)
                .expect(422)

            await request(app)
                .patch(`${routePath}/users/customer`)
                .send({name: "test", surname: "test", address: "", birthdate: "1994-02-27"})
                .set("Cookie", adminCookie)
                .expect(422)

            await request(app)
                .patch(`${routePath}/users/customer`)
                .send({name: "test", surname: "test", address: "test", birthdate: ""})
                .set("Cookie", adminCookie)
                .expect(422)
        })
    })

    describe("POST ezelectronics/sessions", () => {
        test("It returns the logged in user", async () => {
            await postUser(admin)
            adminCookie = await login(admin)

            const admins = await request(app)
                .post(`${routePath}/sessions`)
                .send({username: "admin", password: "admin"})
                .set("Cookie", adminCookie)
                .expect(200)

            let adm = admins.body
            expect(adm.username).toBe(admin.username)
            expect(adm.name).toBe(admin.name)
            expect(adm.surname).toBe(admin.surname)
        })

        test("It should return a 401 error code if the username does not exist in the database", async () => {
            await request(app)
                .post(`${routePath}/sessions`)
                .send({username: "admin", password: "admin"})
                .expect(401)
        })

        test("It should return a 401 error code if the password provided does not match the one in the database", async () => {
            await postUser(admin)
            adminCookie = await login(admin)

            await request(app)
                .post(`${routePath}/sessions`)
                .send({username: "admin", password: "adminx"})
                .set("Cookie", adminCookie)
                .expect(401)
        })
    })

    describe("DELETE ezelectronics/sessions/current", () => {
        test("Performs logout for the currently logged in user and returns a 200 status code", async () => {
            await postUser(admin)
            adminCookie = await login(admin)

            await request(app)
                .delete(`${routePath}/sessions/current`)
                .set("Cookie", adminCookie)
                .expect(200)
        })

        test("It should return a 401 cose error if the user is not logged in", async () => {
            await postUser(admin)

            await request(app)
                .delete(`${routePath}/sessions/current`)
                .expect(401)
        })
    })

    describe("GET ezelectronics/sessions/current", () => {
        test("Retrieves information about the currently logged in user", async () => {
            await postUser(admin)
            adminCookie = await login(admin)

            const admins = await request(app)
                .get(`${routePath}/sessions/current`)
                .set("Cookie", adminCookie)
                .expect(200)

            let adm = admins.body
            expect(adm.username).toBe(admin.username)
            expect(adm.name).toBe(admin.name)
            expect(adm.surname).toBe(admin.surname)
        })

        test("It should return a 401 cose error if the user is not logged in", async () => {
            await postUser(admin)

            await request(app)
                .get(`${routePath}/sessions/current`)
                .expect(401)
        })
    })
})
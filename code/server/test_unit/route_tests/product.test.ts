import {jest, describe, test, beforeAll, beforeEach, afterEach, expect} from "@jest/globals";
import request from "supertest"
import { app } from "../..";
import Authenticator from "../../src/routers/auth";
import { Category, Product } from "../../src/components/product";
import { execPath } from "process";
import ProductController from "../../src/controllers/productController";
import { error } from "console";
import { EmptyProductStockError, LowProductStockError, ProductAlreadyExistsError, ProductNotFoundError } from "../../src/errors/productError";
import { DateError, Time } from "../../src/utilities";
import { ValidationError } from "express-validator";

const baseURL = "/ezelectronics/products";
const mockMiddleware = jest.fn((req, res, next: any) => next());
 

jest.mock("../../src/routers/auth");
/*
jest.mock('express-validator', () => ({
    check: jest.fn().mockImplementation(() => ({
        isIn: jest.fn().mockReturnThis(),
        optional: jest.fn().mockReturnThis(),
        isString: jest.fn().mockReturnThis(),
    })),
    validationResult: jest.fn().mockImplementation((req) => ({
        isEmpty: () => true,
        array: () => [],
    })),
}));
*/


describe("Product router test:", () => {


    beforeEach(() => {
    jest.clearAllMocks();
  
    jest
      .spyOn(Authenticator.prototype, "isLoggedIn")
      .mockImplementation(mockMiddleware);
    jest
      .spyOn(Authenticator.prototype, "isAdminOrManager")
      .mockImplementation(mockMiddleware);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    

    describe("POST - Testing of the Route for registering the arrival of a set of product:", () => {

        test("It should fail if the user is not an Admin or Manager", async () => {

             jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            });
            const response = await request(app).get(baseURL);
            expect(response.status).toBe(401);
        })

        test("it should return 200 if the body content is valid", async () =>{

            //const testProduct = new Product(123, "TestModel", Category.SMARTPHONE, "2024-02-03", "TestDetails", 10);
            const statusOk = 200;
            
            const mockControllerRegisterProducts = jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();

            const response = await request(app)
                .post(baseURL + "/")
                .send({
                    model: "TestModel",
                    category: "Smartphone",
                    quantity: 10,
                    details:  "TestDetails",
                    sellingPrice: 123,
                    arrivalDate: "2024-02-03"

                });

            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerRegisterProducts).toHaveBeenCalledTimes(1);
        
            expect(response.status).toBe(statusOk);

        });

        test("It should return a 409 error if `model` represents an already existing set of products in the database", async() => {
            
            const statusCode = 409;
            const err = new ProductAlreadyExistsError();
            const mockControllerRegisterProducts = jest.spyOn(ProductController.prototype, "registerProducts").mockRejectedValueOnce(err);

            const response = await request(app)
                .post(baseURL + "/")
                .send({
                    model: "TestModel",
                    category: "Smartphone",
                    quantity: 10,
                    details:  "TestDetails",
                    sellingPrice: 123,
                    arrivalDate: "2024-02-03"
                });
            
                expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);

                expect(mockControllerRegisterProducts).toHaveBeenCalledTimes(1);

            expect(response.status).toBe(statusCode);


        });

        describe("Testing body content:", () => {

           
                
            test("it should return an error if the format of the Date is invalid", async () => {

                const errDate = new DateError();
    
                const invalidFormatErr = 422;
                const mockControllerRegisterProducts = jest.spyOn(ProductController.prototype, "registerProducts").mockRejectedValueOnce(errDate);
                
                const response = await request(app)
                .post(baseURL + "/")
                .send({
                    model: "TestModel",
                    category: "Smartphone",
                    quantity: 10,
                    details:  "TestDetails",
                    sellingPrice: 123,
                    arrivalDate: "20-12-2023"
                })

                //expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerRegisterProducts).toHaveBeenCalledTimes(0);
                expect(response.status).toBe(invalidFormatErr);

            });

            
        
            test("Quantity must be greater than 0", async () => {

                const error = 422;
                const mockControllerRegisterProducts = jest.spyOn(ProductController.prototype, "registerProducts").mockRejectedValueOnce(new Error());

                const response = await request(app)
                .post(baseURL + "/")
                .send({
                    model: "TestModel",
                    category: "Smartphone",
                    quantity: -10,
                    details:  "TestDetails",
                    sellingPrice: 123,
                    arrivalDate: "2024-02-03"
                });

                //expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerRegisterProducts).toHaveBeenCalledTimes(0);

                expect(response.status).toBe(error);

            });

            test("Model must not to be empty", async () => {

                const error = 422;
                const mockControllerRegisterProducts = jest.spyOn(ProductController.prototype, "registerProducts").mockRejectedValueOnce(new Error());

                const response = await request(app)
                .post(baseURL + "/")
                .send({
                    model: "",
                    category: "Smartphone",
                    quantity: 10,
                    details:  "TestDetails",
                    sellingPrice: 123,
                    arrivalDate: "2024-02-03"
                });

                //expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerRegisterProducts).toHaveBeenCalledTimes(0);

                expect(response.status).toBe(error);


            });

            test("selling price must to be grater than 0", async () =>{

                const error = 422;
                const mockControllerRegisterProducts = jest.spyOn(ProductController.prototype, "registerProducts").mockRejectedValueOnce(new Error());

                const response = await request(app)
                .post(baseURL + "/")
                .send({
                    model: "TestModel",
                    category: "Smartphone",
                    quantity: 10,
                    details:  "TestDetails",
                    sellingPrice: -123,
                    arrivalDate: "2024-02-03"
                });

               // expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerRegisterProducts).toHaveBeenCalledTimes(0);

                expect(response.status).toBe(error);
            });


            test("Category must to be one of Smartpone, Laptop or Appliance", async () =>{

                const error = 422;
                const mockControllerRegisterProducts = jest.spyOn(ProductController.prototype, "registerProducts").mockRejectedValueOnce(new Error());

                const response = await request(app)
                .post(baseURL + "/")
                .send({
                    model: "TestModel",
                    category: "WrongCategory",
                    quantity: 10,
                    details:  "TestDetails",
                    sellingPrice: 123,
                    arrivalDate: "2024-02-03"
                });

               // expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerRegisterProducts).toHaveBeenCalledTimes(0);

                expect(response.status).toBe(error);
            });
            

        });

    
    });

    describe("PATCH - Testing of the Route for registering the increase in quantity of a product:", () => {

        test("it should return the new quantity of the product", async () => {
            const statusOk = 200;
            const testModel = "testModel";
            const newQuantity = 5;
            const quantity = 10;

            const availableQuantity = quantity + newQuantity;


           const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "changeProductQuantity").mockResolvedValueOnce(availableQuantity);

            const response = await request(app)
                .patch(baseURL + `/${testModel}`)
                .send({
                    model: "testModel",
                    quantity: newQuantity,
                    date: "2024-03-03"
                })

            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(1);    

            expect(response.status).toBe(statusOk);
            
        });

        test("It should return a 404 error if `model` does not represent a product in the database", async() => {
            
            const statusCode = 404;
            const testModel = "testModel";
            const err = new ProductNotFoundError();
            const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "changeProductQuantity").mockRejectedValueOnce(err);

            const response = await request(app)
                .patch(baseURL + `/${testModel}`)
                .send({
                    model: testModel,
                    quantity: 5,
                    date: "2024-03-03"
                });

            expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(1);    
            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(response.status).toBe(statusCode);

        });

        describe("Date validation testing:", () => {

            test("It should return a 400 error if `changeDate` is after the current date", async () => {

                const invalidDateErr = 400;
                const testModel = "testModel";

                const err = new DateError();
                const today = new Date();
                const futureDate = new Date(today);
                futureDate.setDate(today.getDate()+ 1);

                const futureDateString = futureDate.toISOString().split('T')[0]; 
                
                const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "changeProductQuantity").mockRejectedValueOnce(err);
    
                const response = await request(app)
                    .patch(baseURL + `/${testModel}`)
                    .send({
                        model: testModel,
                        quantity: 5,
                        date: futureDateString
                    });
    
                expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(1);    
                expect(response.status).toBe(invalidDateErr);
            
            });
    
            test("It should return a 400 error if `changeDate` is before the product's `arrivalDate`", async () => {
                
                const invalidDateErr = 400;
                const err = new DateError();

                const testProduct = new Product(123, "TestModel", Category.SMARTPHONE, "2020-02-02", "TestDetails", 12);
    
                const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "changeProductQuantity").mockRejectedValueOnce(err);
    
                const response = await request(app)
                    .patch(baseURL + "/:model")
                    .send({
                        model: "testModel",
                        quantity: 5,
                        date: "2020-02-01"
                    });
    
                expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(1);    
    
                expect(response.status).toBe(invalidDateErr);
    
            });

            test("it should return an error if date format is invalid ", async () => {

                const invalidDateErr = 400;
                const err = new DateError();
    
                const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "changeProductQuantity").mockRejectedValueOnce(err);
    
                const response = await request(app)
                    .patch(baseURL + "/:model")
                    .send({
                        model: "testModel",
                        quantity: 5,
                        date: "22-03-2013"
                    });
    
                expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(1);    
                expect(response.status).toBe(invalidDateErr);
    
            });

           
        });

        test("Quantity must be greater than 0", async () => {

            const codeErr = 422;
            const err = new Error("Quantity must be greater than 0");
    
            const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "changeProductQuantity").mockRejectedValueOnce(err);

            const response = await request(app)
                .patch(baseURL + "/:model")
                .send({
                    model: "testModel",
                    quantity: 0,
                    date: "2024-03-12"
                });

            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(0);
            expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(0);    
            expect(response.status).toBe(codeErr);

        });
        
        test("It should reject an error if it occures", async () => {

            const codeErr = 503;
            const err = new Error("Generic error");
    
            const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "changeProductQuantity").mockRejectedValueOnce(err);

            const response = await request(app)
                .patch(baseURL + "/:model")
                .send({
                    model: "testModel",
                    quantity: 5,
                    date: "2024-03-12"
                });

            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(1);    
            expect(response.status).toBe(codeErr);

        });

    

    });

    describe("PATCH - Testing of the Route for selling a product:", () => {

        test("it should return the new quantity of the product", async () => {
            const statusOk = 200;
            const testModel = "testModel"

            const newQuantity = 5;
            const quantity = 10;

            const availableQuantity = quantity - newQuantity;


           const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValueOnce(availableQuantity);

            const response = await request(app)
                .patch(baseURL + `/${testModel}/sell`)
                .send({
                    model: testModel,
                    quantity: newQuantity,
                    date: "2024-03-03"
                })

            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(1);    

            expect(response.status).toBe(statusOk);
            
        });

       test("It should return a 404 error if `model` does not represent a product in the database", async() => {
            
            const statusCode = 404;
            const err = new ProductNotFoundError();
            const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValueOnce(err);

            const response = await request(app)
                .patch(baseURL + "/:model/sell")
                .send({
                    model: "testModel",
                    quantity: 5,
                    date: "2024-03-03"
                });

            expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(1);    
            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(response.status).toBe(statusCode);
            
        });

    

        describe("Date validation testing:", () => {

            test("It should return a 400 error if `sellingDate` is after the current date", async () => {

                const invalidDateErr = 400;
                const err = new DateError();

                const today = new Date();
                const futureDate = new Date(today);
                futureDate.setDate(today.getDate()+ 1);
                const futureDateString = futureDate.toISOString().split('T')[0]; 


               
                const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValueOnce(err);
    
                const response = await request(app)
                    .patch(baseURL + "/:model/sell")
                    .send({
                        model: "testModel",
                        quantity: 5,
                        date: futureDateString
                    });
    
                expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(1);    
    
                expect(response.status).toBe(invalidDateErr);
    
    
            });
    
            test("It should return a 400 error if `sellingDate` is before the product's `arrivalDate`", async () => {
                
                const invalidDateErr = 400;
                const err = new DateError();
    
                const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValueOnce(err);
    
                const response = await request(app)
                    .patch(baseURL + "/:model/sell")
                    .send({
                        model: "testModel",
                        quantity: 5,
                        date: "1980-03-03"
                    });
    
                expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(1);    
    
                expect(response.status).toBe(invalidDateErr);
    
            });

            test("it should return an error if date format is invalid ", async () => {

                const invalidDateErr = 503;
                const err = new Error("Invalid date");
    
                const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValueOnce(err);
    
                const response = await request(app)
                    .patch(baseURL + "/:model/sell")
                    .send({
                        model: "testModel",
                        quantity: 5,
                        date: "22-03-2013"
                    });
    
                expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(1);    
                expect(response.status).toBe(invalidDateErr);
    
            });

        });

        test("It should return a 409 error if `model` represents a product whose available quantity is 0", async () => {

            const codeErr = 409;
            const err = new EmptyProductStockError();
    
            const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValueOnce(err);

            const response = await request(app)
                .patch(baseURL + "/:model/sell")
                .send({
                    model: "testModel",
                    quantity: 5,
                    date: "2024-03-12"
                });

            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(1);    
            expect(response.status).toBe(codeErr);

        });


        test("It should return a 409 error if the available quantity of `model` is lower than the requested `quantity`", async ()=> {
           
            const codeErr = 409;
            const err = new LowProductStockError();
    
            const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValueOnce(err);

            const response = await request(app)
                .patch(baseURL + "/:model/sell")
                .send({
                    model: "testModel",
                    quantity: 5,
                    date: "2024-03-12"
                });

            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(1);    
            expect(response.status).toBe(codeErr);


        });
        
        test("It should reject an error if it occures", async () => {

            const codeErr = 503;
            const err = new Error("Generic error");
    
            const mockControllerChangeProductQuantity = jest.spyOn(ProductController.prototype, "sellProduct").mockRejectedValueOnce(err);

            const response = await request(app)
                .patch(baseURL + "/:model/sell")
                .send({
                    model: "testModel",
                    quantity: 5,
                    date: "2024-03-12"
                });

            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerChangeProductQuantity).toHaveBeenCalledTimes(1);    
            expect(response.status).toBe(codeErr);

        });

    

    });

    describe("GET - Testing of Route for retrieving all products:", () => {

        test("It should fail if the user is not an Admin or Manager", async () => {

            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
               return res.status(401).json({ error: "Unauthorized" });
           });
           const response = await request(app).get(baseURL);
           expect(response.status).toBe(401);
       })

        test("it should return all available product -> 200", async () => {

            const ok = 200;

            const testProduct1 = new Product(123, "TestModel1", Category.SMARTPHONE, "2023-02-02", "TestDetails", 10);
            const testProduct2 = new Product(123, "TestModel2", Category.SMARTPHONE, "2023-02-02", "TestDetails", 10);
            
            const testProducts = [testProduct1, testProduct2];

            const mockControllerGetProducts = jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce(testProducts);

            const resolve = await request(app)
                .get(baseURL)
                .send(
                    {
                        grouping: "",
                        category: "",
                        model: ""
                    }
                );
             
            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerGetProducts).toHaveBeenCalledTimes(1);
            expect(resolve.status).toBe(ok);
        
        });

        describe("It should return a 422 error if `grouping` is null and any of `category` or `model` is not null", () =>{
           
            test("grouping null and category not null", async () => {

                const errCode = 422;
                const err = new Error("category must to be null");

                const mockControllerGetProducts = jest.spyOn(ProductController.prototype, "getProducts").mockRejectedValueOnce(err);

                const resolve = await request(app)
                    .get(baseURL)
                    .query(
                        {
                            grouping: "",
                            category: "Smartphone",
                            model: ""
                        }
                    );
                
                expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(0);
                expect(mockControllerGetProducts).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);

            });

            test("grouping null and model not null", async () => {

                const errCode = 422;
                const err = new Error("Model must be null");

                const mockControllerGetProducts = jest.spyOn(ProductController.prototype, "getProducts").mockRejectedValueOnce(err);

                const resolve = await request(app)
                    .get(baseURL)
                    .query(
                        {
                            grouping: "",
                            category: "",
                            model: "TestModel"
                        }
                    );
                
                //expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerGetProducts).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);

            });
        })

        describe("It should return a 422 error if `grouping` is `category` and `category` is null OR `model` is not null", () => {

            test("grouping = Category and category null", async ()=>{
                const errCode = 422;
                const err = new Error("category must to be not null");
    
                const mockControllerGetProducts = jest.spyOn(ProductController.prototype, "getProducts").mockRejectedValueOnce(err);
    
                const resolve = await request(app)
                    .get(baseURL)
                    .query(
                        {
                            grouping: "category",
                            category: "",
                            model: ""
                        }
                    );
                 
                expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(0);
                expect(mockControllerGetProducts).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);
    
            });

            test("grouping = Category and model not null", async ()=>{
                const errCode = 422;
                const err = new Error("model must to be null");
    
                const mockControllerGetProducts = jest.spyOn(ProductController.prototype, "getProducts").mockRejectedValueOnce(err);
    
                const resolve = await request(app)
                    .get(baseURL)
                    .query(
                        {
                            grouping: "category",
                            category: "",
                            model: "TestModel"
                        }
                    );
                 
                //expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerGetProducts).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);
    
            });

            test("grouping = Category and category not null and model not null", async ()=>{
                const errCode = 422;
                const err = new Error("category and model cannot both be not null");
    
                const mockControllerGetProducts = jest.spyOn(ProductController.prototype, "getProducts").mockRejectedValueOnce(err);
    
                const resolve = await request(app)
                    .get(baseURL)
                    .query(
                        {
                            grouping: "category",
                            category: "Smartphone",
                            model: "TestModel"
                        }
                    );
                 
                //expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerGetProducts).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);
            });

        })
        

        describe("It should return a 422 error if `grouping` is `model` and `model` is null OR `category` is not null", () => {

            test("grouping = model and model null", async ()=>{
                const errCode = 422;
                const err = new Error("model must to be not null");
    
                const mockControllerGetProducts = jest.spyOn(ProductController.prototype, "getProducts").mockRejectedValueOnce(err);
    
                const resolve = await request(app)
                    .get(baseURL)
                    .query(
                        {
                            grouping: "model",
                            category: "",
                            model: ""
                        }
                    );
                 
                //expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerGetProducts).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);
    
            });

            test("grouping = model and category not null", async ()=>{
                const errCode = 422;
                const err = new Error("category must to be null");
    
                const mockControllerGetProducts = jest.spyOn(ProductController.prototype, "getProducts").mockRejectedValueOnce(err);
    
                const resolve = await request(app)
                    .get(baseURL)
                    .query(
                        {
                            grouping: "model",
                            category: "Smartphone",
                            model: ""
                        }
                    );
                 
                //expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerGetProducts).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);
    
            });

            test("grouping = model and category not null", async ()=>{
                const errCode = 422;
                const err = new Error("category and model cannot both be not null");
    
                const mockControllerGetProducts = jest.spyOn(ProductController.prototype, "getProducts").mockRejectedValueOnce(err);
    
                const resolve = await request(app)
                    .get(baseURL)
                    .query(
                        {
                            grouping: "model",
                            category: "Smartphone",
                            model: "TestMOdel"
                        }
                    );
                 
                //expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
                expect(mockControllerGetProducts).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);
    
            });

        });

        test("It should return a 404 error if `model` does not represent a product in the database (only when `grouping` is `model`)", async ()=> {
            
            const errCode = 404;
            const err = new ProductNotFoundError();

            const mockControllerGetProducts = jest.spyOn(ProductController.prototype, "getProducts").mockRejectedValueOnce(err);

            const resolve = await request(app)
                .get(baseURL)
                .query(
                    {
                        grouping: "model",
                        category: "",
                        model: "TestModel"
                    }
            );
         
            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerGetProducts).toHaveBeenCalledTimes(1);
            expect(resolve.status).toBe(errCode);
        });

        test("It should return an error if category is not one of Laptop, Smarphone or Appliance", async () => {
            const errCode = 422;
            const err = new Error("Category not valid");

            const mockControllerGetProducts = jest.spyOn(ProductController.prototype, "getProducts").mockRejectedValueOnce(err);

            const resolve = await request(app)
                .get(baseURL)
                .query(
                    {
                        grouping: "category",
                        category: "UnknownCat",
                        model: ""
                    }
            );
         
            //expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerGetProducts).toHaveBeenCalledTimes(0);
            expect(resolve.status).toBe(errCode);
        });
        


        
    });

    describe("GET - Testing of the Route for retrieving all available products:", () => {


        test("It should fail if the user is not an LoggedIn", async () => {

              jest.spyOn(Authenticator.prototype, "isLoggedIn").mockImplementation((req, res, next) => {
                return res.status(401).json({ error: "Unauthorized" });
            })
            
            const response = await request(app).get(baseURL + "/available")
            expect(response.status).toBe(401)
        })

        test("it should return all available product -> 200", async () => {

            const ok = 200;

            const testProduct1 = new Product(123, "TestModel1", Category.SMARTPHONE, "2023-02-02", "TestDetails", 10);
            const testProduct2 = new Product(123, "TestModel2", Category.SMARTPHONE, "2023-02-02", "TestDetails", 10);
            
            const testProducts = [testProduct1, testProduct2];

            const mockControllerGetAvailableProduct = jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce(testProducts);

            const resolve = await request(app)
                .get(baseURL + "/available")
                .query(
                    {
                        grouping: "",
                        category: "",
                        model: ""
                    }
                );
             
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
            expect(mockControllerGetAvailableProduct).toHaveBeenCalledTimes(1);
            expect(resolve.status).toBe(ok);
        
        });

        describe("It should return a 422 error if `grouping` is null and any of `category` or `model` is not null", () =>{
            test("grouping null and category not null", async () => {

                const errCode = 422;
                const err = new Error("category must to be null");

                const mockControllerGetAvailableProduct = jest.spyOn(ProductController.prototype, "getAvailableProducts").mockRejectedValueOnce(err);

                const resolve = await request(app)
                    .get(baseURL + "/available")
                    .query(
                        {
                            grouping: "",
                            category: "Smartphone",
                            model: ""
                        }
                    );
                
                expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(0);
                expect(mockControllerGetAvailableProduct).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);

            });

            test("grouping null and model not null", async () => {

                const errCode = 422;
                const err = new Error("Model must be null");

                const mockControllerGetAvailableProduct = jest.spyOn(ProductController.prototype, "getAvailableProducts").mockRejectedValueOnce(err);

                const resolve = await request(app)
                    .get(baseURL + "/available")
                    .query(
                        {
                            grouping: "",
                            category: "",
                            model: "TestModel"
                        }
                    );
                
                expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(0);
                expect(mockControllerGetAvailableProduct).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);

            });
        })

        describe("It should return a 422 error if `grouping` is `category` and `category` is null OR `model` is not null", () => {

            test("grouping = Category and category null", async ()=>{
                const errCode = 422;
                const err = new Error("category must to be not null");
    
                const mockControllerGetAvailableProduct = jest.spyOn(ProductController.prototype, "getAvailableProducts").mockRejectedValueOnce(err);
    
                const resolve = await request(app)
                    .get(baseURL + "/available")
                    .query(
                        {
                            grouping: "category",
                            category: "",
                            model: ""
                        }
                    );
                 
                expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(0);
                expect(mockControllerGetAvailableProduct).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);
    
            });

            test("grouping = Category and model not null", async ()=>{
                const errCode = 422;
                const err = new Error("model must to be null");
    
                const mockControllerGetAvailableProduct = jest.spyOn(ProductController.prototype, "getAvailableProducts").mockRejectedValueOnce(err);
    
                const resolve = await request(app)
                    .get(baseURL + "/available")
                    .query(
                        {
                            grouping: "category",
                            category: "",
                            model: "TestModel"
                        }
                    );
                 
                expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(0);
                expect(mockControllerGetAvailableProduct).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);
    
            });

            test("grouping = Category and category not null and model not null", async ()=>{
                const errCode = 422;
                const err = new Error("category and model cannot both be not null");
    
                const mockControllerGetAvailableProduct = jest.spyOn(ProductController.prototype, "getAvailableProducts").mockRejectedValueOnce(err);
    
                const resolve = await request(app)
                    .get(baseURL + "/available")
                    .query(
                        {
                            grouping: "category",
                            category: "Smartphone",
                            model: "TestModel"
                        }
                    );
                 
                expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(0);
                expect(mockControllerGetAvailableProduct).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);
            });

        })
        

        describe("It should return a 422 error if `grouping` is `model` and `model` is null OR `category` is not null", () => {

            test("grouping = model and model null", async ()=>{
                const errCode = 422;
                const err = new Error("model must to be not null");
    
                const mockControllerGetAvailableProduct = jest.spyOn(ProductController.prototype, "getAvailableProducts").mockRejectedValueOnce(err);
    
                const resolve = await request(app)
                    .get(baseURL + "/available")
                    .query(
                        {
                            grouping: "model",
                            category: "",
                            model: ""
                        }
                    );
                 
                expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(0);
                expect(mockControllerGetAvailableProduct).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);
    
            });

            test("grouping = model and category not null", async ()=>{
                const errCode = 422;
                const err = new Error("category must to be null");
    
                const mockControllerGetAvailableProduct = jest.spyOn(ProductController.prototype, "getAvailableProducts").mockRejectedValueOnce(err);
    
                const resolve = await request(app)
                    .get(baseURL + "/available")
                    .query(
                        {
                            grouping: "model",
                            category: "Smartphone",
                            model: ""
                        }
                    );
                 
                expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(0);
                expect(mockControllerGetAvailableProduct).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);
    
            });

            test("grouping = model and category not null", async ()=>{
                const errCode = 422;
                const err = new Error("category and model cannot both be not null");
    
                const mockControllerGetAvailableProduct = jest.spyOn(ProductController.prototype, "getAvailableProducts").mockRejectedValueOnce(err);
    
                const resolve = await request(app)
                    .get(baseURL + "/available")
                    .query(
                        {
                            grouping: "model",
                            category: "Smartphone",
                            model: "TestMOdel"
                        }
                    );
                 
                expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(0);
                expect(mockControllerGetAvailableProduct).toHaveBeenCalledTimes(0);
                expect(resolve.status).toBe(errCode);
    
            });

        });

        test("It should return a 404 error if `model` does not represent a product in the database (only when `grouping` is `model`)", async ()=> {
            
            const errCode = 404;
            const err = new ProductNotFoundError();

            const mockControllerGetAvailableProduct = jest.spyOn(ProductController.prototype, "getAvailableProducts").mockRejectedValueOnce(err);

            const resolve = await request(app)
                .get(baseURL + "/available")
                .query(
                    {
                        grouping: "model",
                        category: "",
                        model: "TestModel"
                    }
            );
         
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(1);
            expect(mockControllerGetAvailableProduct).toHaveBeenCalledTimes(1);
            expect(resolve.status).toBe(errCode);
        });

        test("It should return an error if category is not one of Laptop, Smarphone or Appliance", async () => {
            const errCode = 422;
            const err = new Error("Category not valid");

            const mockControllerGetAvailableProduct = jest.spyOn(ProductController.prototype, "getAvailableProducts").mockRejectedValueOnce(err);

            const resolve = await request(app)
                .get(baseURL + "/available")
                .query(
                    {
                        grouping: "category",
                        category: "UnknownCat",
                        model: ""
                    }
            );
         
            expect(Authenticator.prototype.isLoggedIn).toHaveBeenCalledTimes(0);
            expect(mockControllerGetAvailableProduct).toHaveBeenCalledTimes(0);
            expect(resolve.status).toBe(errCode);
        });


    
    });

    describe("DELETE - Testing of the Route for deleting all products:", () => {
        
        test("It should fail if the user is not an Admin or Manager", async () => {

            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
               return res.status(401).json({ error: "Unauthorized" });
           });
           const response = await request(app).get(baseURL);
           expect(response.status).toBe(401);
       })

        test("it should return 200 if all products has been deleted", async () => {
            const ok = 200;

            const mockControllerDeleteAllProducts = jest.spyOn(ProductController.prototype, "deleteAllProducts").mockResolvedValueOnce(true);

            const resolve = await request(app).delete(baseURL);
            
            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerDeleteAllProducts).toHaveBeenCalledTimes(1);
            expect(resolve.status).toBe(ok);
            
        });

        test("it should return 503 if an error occures", async () => {

            const errCode = 503;

            const mockControllerDeleteAllProducts = jest.spyOn(ProductController.prototype, "deleteAllProducts").mockRejectedValueOnce(errCode);
            const resolve = await request(app).delete(baseURL);
            
            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerDeleteAllProducts).toHaveBeenCalledTimes(1);
            expect(resolve.status).toBe(errCode);
            


        });
    
    });

    describe("DELETE - Testing of the Route for deleting a product:", () => {

        test("It should fail if the user is not an Admin or Manager", async () => {

            jest.spyOn(Authenticator.prototype, "isAdminOrManager").mockImplementation((req, res, next) => {
               return res.status(401).json({ error: "Unauthorized" });
           });
           const response = await request(app).get(baseURL);
           expect(response.status).toBe(401);
       });

        test("It should return 200 if a product has been deleted", async () => {

            const ok = 200;
            const testModel = "TestModel";

            const mockControllerDeleteProduct = jest.spyOn(ProductController.prototype, "deleteProduct").mockResolvedValueOnce(true);

            const resolve = await request(app).delete(baseURL + `/${testModel}`).send({model: testModel});
            
            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerDeleteProduct).toHaveBeenCalledTimes(1);
            expect(resolve.status).toBe(ok);

        });
        
        test("It should return a 404 error if `model` does not represent a product in the database", async () => {
            const errCode = 404;
            const testModel = "TestModel";

            const err = new ProductNotFoundError();

            const mockControllerDeleteProduct = jest.spyOn(ProductController.prototype, "deleteProduct").mockRejectedValueOnce(err);

            const resolve = await request(app).delete(baseURL + `/${testModel}`).send({model: testModel});
            
            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerDeleteProduct).toHaveBeenCalledTimes(1);
            expect(resolve.status).toBe(errCode);


        });

        
        test("it should return 503 if an error occures", async () => {

            const errCode = 503;
            const err = new Error();

            const testModel = "TestModel";

            const mockControllerDeleteProduct = jest.spyOn(ProductController.prototype, "deleteProduct").mockRejectedValueOnce(err);
            const resolve = await request(app).delete(baseURL + `/${testModel}`).send({model: testModel});
            
            expect(Authenticator.prototype.isAdminOrManager).toHaveBeenCalledTimes(1);
            expect(mockControllerDeleteProduct).toHaveBeenCalledTimes(1);
            expect(resolve.status).toBe(errCode);
            
        });

    });



});
 
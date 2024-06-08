import { describe, test, expect, beforeAll, afterAll, jest, beforeEach, afterEach } from "@jest/globals"
import ProductDAO from "../../src/dao/productDAO";
import db from "../../src/db/db";
import { Category } from "../../src/components/product";
import CartDAO from "../../src/dao/cartDAO";
import { ProductAlreadyExistsError, ProductNotFoundError } from "../../src/errors/productError";
import { Database } from "sqlite3";
import { hasUncaughtExceptionCaptureCallback } from "node:process";
import { mock } from "node:test";
import dayjs from "dayjs";


jest.mock("../../src/db/db.ts");

describe("ProductDao test:", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createProduct test:", () => {

        test("it should be return error in case of AlreadyExisting Product", async ()=>{

            const testProduct = {
                model: "TestModel",
                category: "Smartphone",
                quantity: 10,
                details: "TestDetails",
                sellingPrice: 123,
                arrivalDate: "2024-01-01"
            };

            const dao = new ProductDAO();
    
            const uniqueConstraintError = new Error("UNIQUE constraint failed: product_descriptor.Model");
            const dbRunMock = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(uniqueConstraintError);
                return {} as Database;
            });
    
            await expect(dao.createProduct(testProduct.model, testProduct.category, testProduct.quantity, testProduct.details, testProduct.sellingPrice, testProduct.arrivalDate)).rejects.toThrow(ProductAlreadyExistsError);
    
            expect(dbRunMock).toBeCalledTimes(1);
            expect(dbRunMock).toBeCalledWith(
                expect.any(String),
                [testProduct.model, testProduct.sellingPrice, testProduct.arrivalDate, testProduct.quantity, testProduct.category, testProduct.details],
                expect.any(Function)
            );
        });
    
        test("createProduct fails with generic error", async () => {

            const testProduct = {
                model: "TestModel",
                category: "Smartphone",
                quantity: 10,
                details: "TestDetails",
                sellingPrice: 123,
                arrivalDate: "2024-01-01"
            };
    
            const dao = new ProductDAO();

            const genericError = new Error("Generic database error");
            const dbRunMock = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
                callback(genericError);
                return {} as Database;
            });
    
            await expect(dao.createProduct(testProduct.model, testProduct.category, testProduct.quantity, testProduct.details, testProduct.sellingPrice, testProduct.arrivalDate)).rejects.toThrow(genericError);
    
            expect(dbRunMock).toBeCalledTimes(1);
            expect(dbRunMock).toBeCalledWith(
                expect.any(String),
                [testProduct.model, testProduct.sellingPrice, testProduct.arrivalDate, testProduct.quantity, testProduct.category, testProduct.details],
                expect.any(Function)
            );
        });

    });


    describe("existProduct test:", () => {


        test("it should return true if the product exist", async () =>{

            const testModel = "TestModel";
            const row = {Model: "TestModel", SellingPrice: 123, ArrivalDate: "2024-01-01", AvailableQuantity: 10, Category: "Smartphone", Details: "TestDetails" };

            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, row);
                return {} as Database;
            });

            const dao = new ProductDAO();
            const result = await dao.existsProduct(testModel);

            expect(mockDBGet).toBeCalledTimes(1);
            expect(mockDBGet).toBeCalledWith(expect.any(String), [testModel], expect.any(Function));

            expect(result).toBe(true);

        });

        test("it should return false if the product does not exist", async () => {

            const testModel = "NotExistingModel";

            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, null);
                return {} as Database;
            });

            const dao = new ProductDAO();
            const result = await dao.existsProduct(testModel);

            expect(mockDBGet).toBeCalledTimes(1);
            expect(mockDBGet).toBeCalledWith(expect.any(String), [testModel], expect.any(Function));
            expect(result).toBe(false);
                
        });

        test("it shoul throw an error if there is a database error", async () =>{

            const testModel = "TestModel";

            const errorMessage = "Database error";

            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) =>{
                callback(new Error(errorMessage), null);
                return {} as Database;
            });


            const dao = new ProductDAO();
            await expect(dao.existsProduct(testModel)).rejects.toThrow(errorMessage);

            expect(mockDBGet).toBeCalledTimes(1);
            expect(mockDBGet).toBeCalledWith(expect.any(String), [testModel], expect.any(Function));
    

        });



    });



    describe("getProductByModel test:", () => {
        
        test("it should trhow error if an error occures", async () => {

            const testModel = "TestModel";
            const errorMessage = "Database error";

            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) =>{
                callback(new Error(errorMessage), null);
                return {} as Database;
            });

            const dao = new ProductDAO();
            await expect(dao.getProductByModel(testModel)).rejects.toThrow(errorMessage);

            expect(mockDBGet).toBeCalledTimes(1);
            expect(mockDBGet).toBeCalledWith(expect.any(String), [testModel], expect.any(Function));


        });

        test("it should return product if it exists", async () => {

            const testModel = 'TestModel';
            const testProduct = {
                model: "TestModel",
                category: "Smartphone",
                quantity: 10,
                details: "TestDetails",
                sellingPrice: 123,
                arrivalDate: "2024-01-01"
            };
    
            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, testProduct);
                return {} as Database;
            });
    
            const dao = new ProductDAO();
            const result = await dao.getProductByModel(testModel);
    
            expect(mockDBGet).toBeCalledTimes(1);
            expect(mockDBGet).toBeCalledWith(expect.any(String), [testModel], expect.any(Function));
            expect(result).toEqual(testProduct);

        });

        test('should return null if the product does not exist', async () => {
            const testModel = 'TestModel';

            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, null);
                return {} as Database;
            });
    
            const dao = new ProductDAO();
            const result = await dao.getProductByModel(testModel);
    
            expect(mockDBGet).toBeCalledTimes(1);
            expect(mockDBGet).toBeCalledWith(expect.any(String), [testModel], expect.any(Function));
            expect(result).toBeNull();
        
        });


    });

    describe("increaseQuantity tests:", () => {

        test("it should throw an ProductNotFoundError if model does not represent a product in the database", async () => {
            
            const testModel = "NotExistingModel";
            const soldQuantity = 5;
            
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, null);
                return {} as Database;
            });

            const dao = new ProductDAO();

            await expect(dao.increaseQuantity(testModel, soldQuantity, null)).rejects.toThrow(ProductNotFoundError);
            expect(mockDBGet).toBeCalledTimes(1);
            
        });

        test("it should increase the available quantity and return the new quantity", async () => {

            const testModel = "TestModel";
            const newQuantity = 5;
            const existingQuantity = 10;
            const updatedQuantity = existingQuantity + newQuantity;
            const testDate = "2024-02-03"

            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, { AvailableQuantity: existingQuantity });
                return {} as Database;
            });

            const mockDBRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as Database;  
            });

            const dao = new ProductDAO();
            const result = await dao.increaseQuantity(testModel, newQuantity, null);

            expect(result).toBe(updatedQuantity);
            
            expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [testModel], expect.any(Function));
            
            expect(mockDBRun).toHaveBeenCalledWith(
                expect.any(String), [updatedQuantity, testDate, testModel],
                expect.any(Function)
            );

        });

        test("it should handle the error during selecting the available quantity", async () => {

            const testModel = "TestModel";
            const newQuantity = 5;

            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(new Error('DB get error'), null);
                return {} as Database;
            });

            const dao = new ProductDAO();
            await expect(dao.increaseQuantity(testModel, newQuantity, null)).rejects.toThrow('DB get error');

            expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [testModel], expect.any(Function));

        });


        test("it should handle error during updating the available quantity", async () =>{

            const testModel = "TestModel";
            const newQuantity = 5;
            const existingQuantity = 10;
            const updatedQuantity = existingQuantity + newQuantity;


            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, { AvailableQuantity: existingQuantity });
                return {} as Database;
            });

            const mockDBRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(new Error('DB run error'));
                return {} as Database;
            });

            const dao = new ProductDAO();
            await expect(dao.increaseQuantity(testModel, newQuantity, null)).rejects.toThrow('DB run error');

            expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [testModel], expect.any(Function));
           
            expect(mockDBRun).toHaveBeenCalledWith(
                expect.any(String),
                [updatedQuantity, dayjs().format('YYYY-MM-DD'), testModel],
                expect.any(Function)
            );


        });

        test("it should update the arrival date if provided", async () =>{
            const testModel = "TestModel";
            const newQuantity = 5;
            const existingQuantity = 10;
            const changeDate = "2024-01-01";
            const updatedQuantity = existingQuantity + newQuantity;

            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, { AvailableQuantity: existingQuantity });
                return {} as Database;
            });

            const mockDBRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });

            const dao = new ProductDAO();
            const result = await dao.increaseQuantity(testModel, newQuantity, changeDate);

            expect(result).toBe(updatedQuantity);
            expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [testModel], expect.any(Function));
           
            expect(mockDBRun).toHaveBeenCalledWith(
                expect.any(String),
                [updatedQuantity, changeDate, testModel],
                expect.any(Function)
            );

        });
        

        test('it should set the arrival date to today if not provided', async () => {

            const testModel = "TestModel";
            const newQuantity = 5;
            const existingQuantity = 10;
            const updatedQuantity = existingQuantity + newQuantity;
        
            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
              callback(null, { AvailableQuantity: existingQuantity });
              return {} as Database;

            });
        
            const mockDBRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
              callback(null);
              return {} as Database;

            });
        
            const dao = new ProductDAO();
            const result = await dao.increaseQuantity(testModel, newQuantity, null);
        
            expect(result).toBe(updatedQuantity);
            expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [testModel], expect.any(Function));
            
            expect(mockDBRun).toHaveBeenCalledWith(
              expect.any(String),
              [updatedQuantity, dayjs().format('YYYY-MM-DD'), testModel],
              expect.any(Function)
            );

          });
          

    } );

    

    describe("decreaseQuantity test:", () => {

        test("it should throw an ProductNotFoundError if model does not represent a product in the database", async () => {
            
            const testModel = "NotExistingModel";
            const soldQuantity = 5;
            
            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, null);
                return {} as Database;
            });

            const dao = new ProductDAO();

            await expect(dao.decreaseQuantity(testModel, soldQuantity, null)).rejects.toThrow(ProductNotFoundError);
            expect(mockDBGet).toBeCalledTimes(1);

        });

        test("it should decrease the available quantity and return the new quantity", async () => {

            const testModel = "TestModel";
            const soldQuantity = 5;
            const existingQuantity = 10;
            const updatedQuantity = existingQuantity - soldQuantity;
            const testDate = "2024-02-03"

            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, { AvailableQuantity: existingQuantity });
                return {} as Database;
            });

            const mockDBRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as Database;  
            });

            const dao = new ProductDAO();
            const result = await dao.decreaseQuantity(testModel, soldQuantity, null);

            expect(result).toBe(updatedQuantity);
            
            expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [testModel], expect.any(Function));
            
            expect(mockDBRun).toHaveBeenCalledWith(
                expect.any(String), [updatedQuantity, testDate, testModel],
                expect.any(Function)
            );

        });

        test("it should handle the error during selecting the available quantity", async () => {

            const testModel = "TestModel";
            const soldQuantity = 5;

            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(new Error('DB get error'), null);
                return {} as Database;
            });

            const dao = new ProductDAO();
            await expect(dao.decreaseQuantity(testModel, soldQuantity, null)).rejects.toThrow('DB get error');

            expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [testModel], expect.any(Function));

        });


        test("it should handle error during updating the available quantity", async () =>{

            const testModel = "TestModel";
            const soldQuantity = 5;
            const existingQuantity = 10;
            const updatedQuantity = existingQuantity - soldQuantity;


            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, { AvailableQuantity: existingQuantity });
                return {} as Database;
            });

            const mockDBRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(new Error('DB run error'));
                return {} as Database;
            });

            const dao = new ProductDAO();
            await expect(dao.decreaseQuantity(testModel, soldQuantity, null)).rejects.toThrow('DB run error');

            expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [testModel], expect.any(Function));
           
            expect(mockDBRun).toHaveBeenCalledWith(
                expect.any(String),
                [updatedQuantity, dayjs().format('YYYY-MM-DD'), testModel],
                expect.any(Function)
            );


        });

        test("it should update the selling date if provided", async () =>{
            const testModel = "TestModel";
            const soldQuantity = 5;
            const existingQuantity = 10;
            const changeDate = "2024-01-01";
            const updatedQuantity = existingQuantity - soldQuantity;

            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, { AvailableQuantity: existingQuantity });
                return {} as Database;
            });

            const mockDBRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(null);
                return {} as Database;
            });

            const dao = new ProductDAO();
            const result = await dao.decreaseQuantity(testModel, soldQuantity, changeDate);

            expect(result).toBe(updatedQuantity);
            expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [testModel], expect.any(Function));
           
            expect(mockDBRun).toHaveBeenCalledWith(
                expect.any(String),
                [updatedQuantity, changeDate, testModel],
                expect.any(Function)
            );

        });
        

        test('it should set the selling date to today if not provided', async () => {

            const testModel = "TestModel";
            const soldQuantity = 5;
            const existingQuantity = 10;
            const updatedQuantity = existingQuantity - soldQuantity;
        
            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
              callback(null, { AvailableQuantity: existingQuantity });
              return {} as Database;

            });
        
            const mockDBRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
              callback(null);
              return {} as Database;

            });
        
            const dao = new ProductDAO();
            const result = await dao.decreaseQuantity(testModel, soldQuantity, null);
        
            expect(result).toBe(updatedQuantity);
            expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [testModel], expect.any(Function));
            
            expect(mockDBRun).toHaveBeenCalledWith(
              expect.any(String),
              [updatedQuantity, dayjs().format('YYYY-MM-DD'), testModel],
              expect.any(Function)
            );

          });

    });
    /*

    TO BE COMMITTED 
    
    describe("getAllProducts test:", () => {


    });

    describe("getAllAvailableProducts test:", () => {

    });

    describe("deleteProducts test:", () => {

    });

    describe("deleteProductByModel test:", () => {

    });

    describe("getProductQuantity test:", () => {

    });

*/


})



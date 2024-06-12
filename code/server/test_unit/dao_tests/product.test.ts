import { describe, test, expect, beforeAll, afterAll, jest, beforeEach, afterEach } from "@jest/globals"
import ProductDAO from "../../src/dao/productDAO";
import db from "../../src/db/db";
import { Category, Product } from "../../src/components/product";
import CartDAO from "../../src/dao/cartDAO";
import { EmptyProductStockError, LowProductStockError, ProductAlreadyExistsError, ProductNotFoundError } from "../../src/errors/productError";
import { Database } from "sqlite3";
import { hasUncaughtExceptionCaptureCallback } from "node:process";
import { mock } from "node:test";
import dayjs from "dayjs";
import { callbackify } from "node:util";
import { error } from "node:console";
import { EmptyCartError } from "../../src/errors/cartError";
import { DateError } from "../../src/utilities";


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

            const testProduct2 = new Product(123, "TestModel", Category.SMARTPHONE, "2024-01-01", "TestDetails", 10);

            const testProduct = {
                SellingPrice: testProduct2.sellingPrice,
                Model: testProduct2.model,
                Category: testProduct2.category,
                ArrivalDate: testProduct2.arrivalDate,
                Details: testProduct2.details,
                AvailableQuantity: testProduct2.quantity
            };

            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null,
                    testProduct
                );
                return {} as Database;
            });

            const dao = new ProductDAO();
            const result = await dao.getProductByModel("TestModel");

            expect(mockDBGet).toBeCalledTimes(1);
            expect(mockDBGet).toBeCalledWith(expect.any(String), [testProduct2.model], expect.any(Function));
            expect(result).toEqual(testProduct2);
              

        });

    });


    describe("increaseQuantity tests:", () => {

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
            const result = await dao.increaseQuantity(testModel, newQuantity, testDate);

            expect(mockDBGet).toHaveBeenCalledTimes(1);
            expect(mockDBRun).toHaveBeenCalledTimes(1);
            expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), expect.arrayContaining([testModel]), expect.any(Function));

            expect(mockDBRun).toHaveBeenCalledWith(
                expect.any(String),
                expect.arrayContaining([updatedQuantity, testDate, testModel]),
                expect.any(Function)
            );

            expect(result).toBe(updatedQuantity);
            
            

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
            const testDate = "2024-03-03";
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
            await expect(dao.increaseQuantity(testModel, newQuantity, testDate)).rejects.toThrow('DB run error');

            expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), expect.arrayContaining([testModel]), expect.any(Function));
           
            expect(mockDBRun).toHaveBeenCalledWith(
                expect.any(String),
                expect.arrayContaining([updatedQuantity, testDate, testModel]),
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
/*

TO FIX

        test("It should return an error if `changeDate` is before the product's `arrivalDate`", async () => {
                
            const testModel = "TestModel";
            const newQuantity = 5;
            const existingQuantity = 10;
            const changeDate = "2024-01-01";
            const updatedQuantity = existingQuantity + newQuantity;
            const err = new DateError();

            const dao = new ProductDAO();

            const testProduct = new Product(123, "TestModel", Category.SMARTPHONE, "2020-02-02", "TestDetails", 12);
           
            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(err, null);
                return {} as Database;
            });

            await dao.increaseQuantity(testModel, newQuantity, changeDate);

            expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [testModel], expect.any(Function));
            expect(mockDBGet).rejects.toThrow(err);


        });
        

   */

    } );

    

    describe("decreaseQuantity test:", () => {

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
            const result = await dao.decreaseQuantity(testModel, soldQuantity, testDate);

            expect(result).toBe(updatedQuantity);
            
            
            expect(mockDBGet).toHaveBeenCalledTimes(1);
            
            expect(mockDBRun).toHaveBeenCalledTimes(1);

            expect(mockDBRun).toHaveBeenCalledWith(
                expect.any(String),
                expect.arrayContaining([updatedQuantity, testDate, testModel]),
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
            const testDate = "2023-04-03"

            const mockDBGet = jest.spyOn(db, 'get').mockImplementation((sql, params, callback) => {
                callback(null, { AvailableQuantity: existingQuantity });
                return {} as Database;
            });

            const mockDBRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(new Error('DB run error'));
                return {} as Database;
            });

            const dao = new ProductDAO();
            await expect(dao.decreaseQuantity(testModel, soldQuantity, testDate)).rejects.toThrow('DB run error');

            expect(mockDBGet).toHaveBeenCalledWith(expect.any(String), [testModel], expect.any(Function));
           
            expect(mockDBRun).toHaveBeenCalledWith(
                expect.any(String),
                expect.arrayContaining([updatedQuantity, testDate, testModel]),
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

        //TO UPDATE TEST OF SELLING DATE


    });
   
    describe("getAllProducts test:", () => {


        test("it should return all products without filers", async () =>{

            const testResultProducts = [
                { SellingPrice: 123, Model: "TestModel1", Category: Category.SMARTPHONE, ArrivalDate: "2024-06-06", Details: "testDetails", AvailableQuantity: 10 },
                { SellingPrice: 123, Model: "TestModel2", Category: Category.LAPTOP, ArrivalDate: "2024-06-06", Details: "testDetails", AvailableQuantity: 10 },
                { SellingPrice: 123, Model: "TestModel3", Category: Category.APPLIANCE, ArrivalDate: "2024-06-06", Details: "testDetails", AvailableQuantity: 10 }
            ];
            
            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) =>{
                callback(null, testResultProducts);
                return {} as Database;
            });

            const testProducts = testResultProducts.map(p => 
                new Product(p.SellingPrice, p.Model, p.Category, p.ArrivalDate, p.Details, p.AvailableQuantity)
            );

            const dao = new ProductDAO();
            //without filters:
            const result = await dao.getAllProducts(null, null, null);

            expect(result).toEqual(testProducts);
            expect(mockDBAll).toBeCalledTimes(1);
        });

        test("it should return products filtered by category", async () => {

            /*
            const testProducts1 = [
                { SellingPrice: 123, Model: "TestModel1", Category: Category.SMARTPHONE, ArrivalDate: "2024-06-06", Details: "testDetails", AvailableQuantity: 10 },
                { SellingPrice: 123, Model: "TestModel2", Category: Category.LAPTOP, ArrivalDate: "2024-06-06", Details: "testDetails", AvailableQuantity: 10 },
                { SellingPrice: 123, Model: "TestModel3", Category: Category.APPLIANCE, ArrivalDate: "2024-06-06", Details: "testDetails", AvailableQuantity: 10 }
            ]
            
            const testProducts2 = [
                new Product(123, "TestModel1", Category.SMARTPHONE, "2024-06-06", "testDetails", 10),
                new Product(123, "TestModel2", Category.LAPTOP, "2024-06-06", "testDetails", 10),
                new Product(123, "TestModel3", Category.APPLIANCE, "2024-06-06", "testDetails", 10)
            ];
            */

            const categoryFiltered = [
                { SellingPrice: 123, Model: "TestModel2", Category: Category.LAPTOP, ArrivalDate: "2024-06-06", Details: "testDetails", AvailableQuantity: 10 },
            ]

            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
              
                callback(null, categoryFiltered);
                return {} as Database;
            })

            const testProducts = categoryFiltered.map(p => 
                new Product(p.SellingPrice, p.Model, p.Category, p.ArrivalDate, p.Details, p.AvailableQuantity)
            );


            const dao = new ProductDAO();
            //Category filters:
            const result = await dao.getAllProducts("Category", "Laptop", null);

            expect(result).toEqual(testProducts);
            expect(mockDBAll).toBeCalledTimes(1);
            

        });

        test("it should return products filtered by model", async () => {
            const modelFiltered = [
                { SellingPrice: 123, Model: "TestModel2", Category: Category.LAPTOP, ArrivalDate: "2024-06-06", Details: "testDetails", AvailableQuantity: 10 },
            ]

            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(null, modelFiltered);
                return {} as Database;
            })

            const testProducts = modelFiltered.map(p => 
                new Product(p.SellingPrice, p.Model, p.Category, p.ArrivalDate, p.Details, p.AvailableQuantity)
            );


            const dao = new ProductDAO();
            //Model filters:
            const result = await dao.getAllProducts("Model", null, "TestModel2");

            expect(result).toEqual(testProducts);
            expect(mockDBAll).toBeCalledTimes(1);
            
        });
    
        test("it should handle database error", async () => {
            const error = new Error("Database error");

            const mockDBAll = jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
              callback(error, null);
              return {} as Database;
            });
        
            const dao = new ProductDAO();
        
            await expect(dao.getAllProducts(null, null, null)).rejects.toThrow(error);
            expect(mockDBAll).toBeCalledTimes(1);
    

        });


    });

    describe("getAllAvailableProducts test:", () => {

    
        test("it should return all available products without filters", async () => {

            const testProducts1 = [
                { SellingPrice: 123, Model: "TestModel1", Category: Category.SMARTPHONE, ArrivalDate: "2024-06-06", Details: "testDetails", AvailableQuantity: 10 },
                { SellingPrice: 123, Model: "TestModel2", Category: Category.LAPTOP, ArrivalDate: "2024-06-06", Details: "testDetails", AvailableQuantity: 10 },
                { SellingPrice: 123, Model: "TestModel3", Category: Category.APPLIANCE, ArrivalDate: "2024-06-06", Details: "testDetails", AvailableQuantity: 10 }
            ]

            const expectedProducts = testProducts1.filter(p => p.AvailableQuantity > 0);

            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(null, expectedProducts);
                return {} as Database;
            })

            const expectResult = expectedProducts.map(p => new Product(p.SellingPrice, p.Model, p.Category, p.ArrivalDate, p.Details, p.AvailableQuantity));

            const dao = new ProductDAO();
            const result = await dao.getAllAvailableProducts(null, null, null);

            expect(result).toEqual(expectResult);
            expect(mockDBAll).toBeCalledTimes(1);

        });

        test("it should return available products filtered by category", async () => {
        
            const categoryFiltered = [
                { SellingPrice: 123, Model: "TestModel2", Category: Category.LAPTOP, ArrivalDate: "2024-06-06", Details: "testDetails", AvailableQuantity: 10 },
            ]

            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
        
                callback(null, categoryFiltered);
                return {} as Database;
            })

            const testProducts = categoryFiltered.map(p => 
                new Product(p.SellingPrice, p.Model, p.Category, p.ArrivalDate, p.Details, p.AvailableQuantity)
            );


            const dao = new ProductDAO();
            //Category filters:
            const result = await dao.getAllAvailableProducts("Category", "Laptop", null);

            expect(result).toEqual(testProducts);
            expect(mockDBAll).toBeCalledTimes(1);
            

        });

        
        test("it should return available products filtered by model", async () => {

            const modelFiltered = [
                { SellingPrice: 123, Model: "TestModel2", Category: Category.LAPTOP, ArrivalDate: "2024-06-06", Details: "testDetails", AvailableQuantity: 10 },
            ]

            const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
                callback(null, modelFiltered);
                return {} as Database;
            })

            const testProducts = modelFiltered.map(p => 
                new Product(p.SellingPrice, p.Model, p.Category, p.ArrivalDate, p.Details, p.AvailableQuantity)
            );


            const dao = new ProductDAO();
            //Model filters:
            const result = await dao.getAllAvailableProducts("Model", null, "TestModel2");

            expect(result).toEqual(testProducts);
            expect(mockDBAll).toBeCalledTimes(1);

        });
        
        test("it should handle database errors", async () => {

            const error = new Error("Database error");

            const mockDBAll = jest.spyOn(db, 'all').mockImplementation((sql, params, callback) => {
              callback(error, null);
              return {} as Database;
            });
        
            const dao = new ProductDAO();
        
            await expect(dao.getAllProducts(null, null, null)).rejects.toThrow(error);
            expect(mockDBAll).toBeCalledTimes(1);
    
        });

    });

    describe("deleteProducts test:", () => {

        test("it should delete all products and resolve to true", async () => {

            const mockDBRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(null);  
                return {} as Database;
            });

            const dao = new ProductDAO();
            const result = await dao.deleteProducts();

            expect(result).toBe(true);
            expect(mockDBRun).toBeCalledTimes(1);
        });

        test("It should reject if there is an error during delection", async () => {
           
            const error = new Error("Database error");

            const mockDBRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(error);  
                return {} as Database;
            });

            const dao = new ProductDAO();

            await expect(dao.deleteProducts()).rejects.toThrow(error); 
            expect(mockDBRun).toBeCalledTimes(1);

        });



    });

    describe("deleteProductByModel test:", () => {


        test("It should return true if the product has been deleted", async () =>{

            const testModel = "TestModel";

            const mockDBRun = jest.spyOn(db, "run").mockImplementationOnce((sql, params, callback) => {
                callback(null, true);
                return {} as Database;
            });

            const dao = new ProductDAO();

            const result = await dao.deleteProductByModel(testModel);

            expect(result).toBe(true);
            expect(mockDBRun).toBeCalledTimes(1);

        });


        test("It should reject if there is an error during delection", async () => {
           
            const error = new Error("Database error");

            const mockDBRun = jest.spyOn(db, 'run').mockImplementation((sql, params, callback) => {
                callback(error);  
                return {} as Database;
            });

            const dao = new ProductDAO();

            await expect(dao.deleteProducts()).rejects.toThrow(error); 
            expect(mockDBRun).toBeCalledTimes(1);

        });



    });

    describe("getProductQuantity test:", () => {


        test("it should return the available quantity of the product", async () =>{

            const testModel = "TestModel";
            const testQuantity = 10;

            const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
                callback(null, {AvailableQuantity: testQuantity });
                return {} as Database;
            });
        
            const dao = new ProductDAO();
            const result = await dao.getProductQuantity(testModel);
            
            expect(result).toBe(testQuantity);
            expect(mockDBGet).toBeCalledTimes(1);

        });

    });

})



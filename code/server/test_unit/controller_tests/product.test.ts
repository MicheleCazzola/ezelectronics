import { test, expect, jest, describe, afterEach } from "@jest/globals"
import ProductController from "../../src/controllers/productController"
import ProductDAO from "../../src/dao/productDAO"
import { after, it } from "node:test";
import { Category, Product } from "../../src/components/product";
import { hasUncaughtExceptionCaptureCallback } from "process";
import { DateError, Time } from "../../src/utilities";
import dayjs from "dayjs";
import { ProductNotFoundError } from "../../src/errors/productError";

jest.mock("../../src/dao/productDAO");

describe("Controller tests", () => {

    afterEach(()=> {

        jest.clearAllMocks();

    });

    describe("registerProducts tests:", () => {
        test("it should call createProduct with correct parameters", async () => {
            //The test cheks if the method it's called correclty
            const testProduct = {
                sellingPrice: 123, 
                model: "TestModel",
                category: "Smartphone",
                arrivalDate: "2024-02-02",
                details: "TestDetails",
                quantity: 1
            }
                
            jest.spyOn(ProductDAO.prototype, "createProduct").mockResolvedValueOnce();

            const controller = new ProductController();
            
            const response = await controller.registerProducts(
                testProduct.model,
                testProduct.category, 
                testProduct.quantity, 
                testProduct.details, 
                testProduct.sellingPrice, 
                testProduct.arrivalDate
            );

            expect(response).toBeUndefined();

            //controlliamo che la createProduct (del DAO) venga chiamata una voltae con i corretti parametri
            expect(ProductDAO.prototype.createProduct).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.createProduct).toHaveBeenCalledWith(testProduct.model, testProduct.category, testProduct.quantity, testProduct.details, testProduct.sellingPrice, testProduct.arrivalDate);
        });

        test("registerProducts - noArrivalData Provided", async () => {

            const todayDate = Time.today();
            const testProduct = {
                sellingPrice: 123, 
                model: "TestModel",
                category: "Smartphone",
                arrivalDate: "",
                details: "TestDetails",
                quantity: 1
            }
                
            jest.spyOn(ProductDAO.prototype, "createProduct").mockResolvedValueOnce();

            const controller = new ProductController();

            const response = await controller.registerProducts(
                testProduct.model,
                testProduct.category, 
                testProduct.quantity, 
                testProduct.details, 
                testProduct.sellingPrice, 
                testProduct.arrivalDate
            );

            expect(response).toBeUndefined();

            expect(ProductDAO.prototype.createProduct).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.createProduct).toHaveBeenCalledWith(testProduct.model, testProduct.category, testProduct.quantity, testProduct.details, testProduct.sellingPrice, todayDate);

        });

        test("registerProducts - future ArrivailData", async () => {

            const futureDate = "2030-02-02";
            const testProduct = {
                sellingPrice: 123, 
                model: "TestModel",
                category: "Smartphone",
                arrivalDate: futureDate,
                details: "TestDetails",
                quantity: 1
            }
                
            const err = new DateError();

            jest.spyOn(ProductDAO.prototype, "createProduct").mockResolvedValueOnce();

            const controller = new ProductController();

            await expect(controller.registerProducts(
                testProduct.model,
                testProduct.category, 
                testProduct.quantity, 
                testProduct.details, 
                testProduct.sellingPrice, 
                testProduct.arrivalDate
            )).rejects.toThrow(err)

            expect(ProductDAO.prototype.createProduct).toHaveBeenCalledTimes(0);
            

        });

    });


    describe("productExist test:", () => {
        //The test checks if the method returns true when de DAO method return true.
        
        test("it should return true if the product identified by the model exists", async ()=> {

            const testModel = "TestModel";
            
            jest.spyOn(ProductDAO.prototype, "existsProduct").mockResolvedValueOnce(true);

            const controller = new ProductController();
            const response = await controller.productExist(testModel);

            expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledWith(testModel);

            expect(response).toBe(true);

        });

        test("it should return false if the product identified by the model doesnt exists", async () => {

            const testModel = "NonExistingModel";

            jest.spyOn(ProductDAO.prototype, "existsProduct").mockResolvedValueOnce(false);

            const controller = new ProductController();
            const response = await controller.productExist(testModel);

            expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledWith(testModel);

            expect(response).toBe(false);
        });
    });

    
    describe("productByModel test: ", () => {

        test("it should return a product", async () => {

            const testModel = "TestModel"
            const testProduct = new Product(1, "TestModel", Category.SMARTPHONE, "2/02/2024", "TestDetails", 1);
            
            jest.spyOn(ProductDAO.prototype, "getProductByModel").mockResolvedValueOnce(testProduct);

            const controller = new ProductController();
            const response = await controller.productByModel(testModel);
            
            expect(ProductDAO.prototype.getProductByModel).toBeCalledTimes(1);
            expect(ProductDAO.prototype.getProductByModel).toHaveBeenCalledWith(testModel);
            
            expect(response).toBe(testProduct);
        
        });

        test("it should reject an error if the product does not exist", async () => {
            const testModel = "TestModel"
            const testProduct = new Product(1, "TestModel", Category.SMARTPHONE, "2/02/2024", "TestDetails", 1);
            
            const err = new ProductNotFoundError();

            jest.spyOn(ProductDAO.prototype, "getProductByModel").mockRejectedValueOnce(err);

            const controller = new ProductController();
            await expect(controller.productByModel(testModel)).rejects.toThrow(err);
            
            expect(ProductDAO.prototype.getProductByModel).toBeCalledTimes(1);
                    
        });


    });


    describe("changeProductquantity test:", () => {

        test("it should return the new quantity of the product", async () => {

            //il test controlla se il metodo ritorna la nuova quantita del prodotto

            const testModel = "TestModel";
            const newQuantity = 5;
            const existingQuantity = 10;
            const updatedQuantity = existingQuantity + newQuantity;
            const testChangeDate = "2024-03-02";

            jest.spyOn(ProductDAO.prototype, "increaseQuantity").mockResolvedValueOnce(updatedQuantity);

            const controller = new ProductController();
            const response = await controller.changeProductQuantity(testModel, newQuantity, testChangeDate);

            expect(ProductDAO.prototype.increaseQuantity).toBeCalledTimes(1);
            expect(ProductDAO.prototype.increaseQuantity).toBeCalledWith(testModel,newQuantity, testChangeDate);
            expect(response).toBe(updatedQuantity);
        
        });    

        test('it should set the arrival date to today if not provided', async () => {

            const testModel = "TestModel";
            const newQuantity = 5;
            const existingQuantity = 10;
            const updatedQuantity = existingQuantity + newQuantity;
            const todayDate = Time.today();
        
            const mockDAOChangeProductQuantity = jest.spyOn(ProductDAO.prototype, "increaseQuantity").mockResolvedValueOnce(updatedQuantity);
           
            const controller = new ProductController();
           
            const result = await controller.changeProductQuantity(testModel, newQuantity, "");

            expect(result).toBe(updatedQuantity);
            expect(mockDAOChangeProductQuantity).toHaveBeenCalledTimes(1);    
            expect(mockDAOChangeProductQuantity).toHaveBeenCalledWith(testModel, newQuantity, todayDate);

        });

        test('it should reject err if the change date is after to today date', async () => {

            const testModel = "TestModel";
            const newQuantity = 5;
            const existingQuantity = 10;
            const updatedQuantity = existingQuantity + newQuantity;
            const futureDate = "2040-03-03";

            const err = new DateError();
        
            const mockDAOChangeProductQuantity = jest.spyOn(ProductDAO.prototype, "increaseQuantity").mockRejectedValueOnce(err);
           
            const controller = new ProductController();
           
            await expect(controller.changeProductQuantity(testModel, newQuantity, futureDate)).rejects.toThrow(err);

           //expect(result).toBe(updatedQuantity);
            expect(mockDAOChangeProductQuantity).toHaveBeenCalledTimes(0);    

        });

        test("it should reject an error if the product does not exist", async () => {
            const testModel = "TestModel"
            const todayDate = Time.today();

            
            const err = new ProductNotFoundError();

            jest.spyOn(ProductDAO.prototype, "increaseQuantity").mockRejectedValueOnce(err);

            const controller = new ProductController();
            await expect(controller.changeProductQuantity(testModel, 10, todayDate)).rejects.toThrow(err);
            
            expect(ProductDAO.prototype.increaseQuantity).toBeCalledTimes(1);
                    
        })

    });

    describe("sellProducts test:", () => {

        test("It should return the available quantity of the product", async () => {
            
            const testModel = "TestModel";
            const testQuantitySold = 2;
            const testSellingDate = "2024-02-02";

            const testQuantity = 5;
            const newQuantity = testQuantity - testQuantitySold;

            jest.spyOn(ProductDAO.prototype, "decreaseQuantity").mockResolvedValueOnce(newQuantity);

            const controller = new ProductController();
            const response = await controller.sellProduct(testModel, testQuantitySold, testSellingDate);

            expect(ProductDAO.prototype.decreaseQuantity).toBeCalledTimes(1);
            expect(ProductDAO.prototype.decreaseQuantity).toBeCalledWith(testModel, testQuantitySold, testSellingDate);

            expect(response).toBe(newQuantity);

        });

        test("it should set the selling date to today if not provided", async () => {

            const testModel = "TestModel";
            const soldQuantity = 5;
            const existingQuantity = 10;
            const updatedQuantity = existingQuantity - soldQuantity;
            const todayDate = Time.today();
        
            const mockDAOSellProduct = jest.spyOn(ProductDAO.prototype, "decreaseQuantity").mockResolvedValueOnce(updatedQuantity);
           
            const controller = new ProductController();
           
            const result = await controller.sellProduct(testModel, soldQuantity, "");

            expect(result).toBe(updatedQuantity);
            expect(mockDAOSellProduct).toHaveBeenCalledTimes(1);    
            expect(mockDAOSellProduct).toHaveBeenCalledWith(testModel, soldQuantity, todayDate);

        });

        test("it should reject err if the sell date is after to today date", async () => {

            const testModel = "TestModel";
            const soldQuantity = 5;
            const futureDate = "2040-03-03";

            const err = new DateError();
        
            const mockDAOSellProduct = jest.spyOn(ProductDAO.prototype, "decreaseQuantity").mockRejectedValueOnce(err);
           
            const controller = new ProductController();
           
            await expect(controller.sellProduct(testModel, soldQuantity, futureDate)).rejects.toThrow(err);

           //expect(result).toBe(updatedQuantity);
            expect(mockDAOSellProduct).toHaveBeenCalledTimes(0);    

        });

        

    });


    describe("getProducts tests:", () => {

        test("it should return products[]", async () => {

            const grouping = "";
            const category = "";
            const model = "";

            const testProduct1 = new Product(1, "TestModel1", Category.SMARTPHONE, "", "", 5);
            const testProduct2 = new Product(1, "TestModel2", Category.LAPTOP, "", "", 5);
            const testProduct3 = new Product(1, "TestModel", Category.APPLIANCE, "", "", 5);
            
            const testProduct = [testProduct1, testProduct2, testProduct3];

            jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce(testProduct);
            
            const controller = new ProductController();
            const response = await controller.getProducts(grouping, category, model);

            expect(ProductDAO.prototype.getAllProducts).toBeCalledTimes(1);
            expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalledWith(grouping, category, model);
            expect(response).toBe(testProduct);

        });



    });

    describe("getAvailableProducts test:", () => {

        test("it should return product[]", async () => {
            const grouping = "";
            const category = "";
            const model = "";

            const testProduct1 = new Product(1, "TestModel1", Category.SMARTPHONE, "", "", 5);
            const testProduct2 = new Product(1, "TestModel2", Category.LAPTOP, "", "", 5);
            const testProduct3 = new Product(1, "TestModel", Category.APPLIANCE, "", "", 5);
            
            const testProduct = [testProduct1, testProduct2, testProduct3];

            jest.spyOn(ProductDAO.prototype, "getAllAvailableProducts").mockResolvedValueOnce(testProduct);

            const controller = new ProductController();
            const response = await controller.getAvailableProducts(grouping, category, model);

            expect(ProductDAO.prototype.getAllAvailableProducts).toBeCalledTimes(1);
            expect(ProductDAO.prototype.getAllAvailableProducts).toHaveBeenCalledWith(grouping, category, model);
            expect(response).toBe(testProduct);

        });
    
    });

    describe("deleteAllProducts test:", () => {

        test("It should return true in case of sucess", async () => {

            jest.spyOn(ProductDAO.prototype, "deleteProducts").mockResolvedValueOnce(true);

            const controller = new ProductController();
            const response = await controller.deleteAllProducts();

            expect(ProductDAO.prototype.deleteProducts).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.deleteProducts).toHaveBeenCalledWith();
            expect(response).toBe(true);

        });

    });


    describe("deleteProduct test:", () => {

        test("It should return true in case of sucess", async () => {

            const testModel = "TestModel";

            jest.spyOn(ProductDAO.prototype, "deleteProductByModel").mockResolvedValueOnce(true);

            const controller = new ProductController();
            const response = await controller.deleteProduct(testModel);

            expect(ProductDAO.prototype.deleteProductByModel).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.deleteProductByModel).toHaveBeenCalledWith(testModel);
            expect(response).toBe(true);

        });

        test("It should reject a 404 error in case of the product does not exist", async () => {

            const testModel = "TestModel";

            const err = new ProductNotFoundError();

            jest.spyOn(ProductDAO.prototype, "deleteProductByModel").mockRejectedValueOnce(err);

            const controller = new ProductController();
            await expect(controller.deleteProduct(testModel)).rejects.toThrow(err);

            expect(ProductDAO.prototype.deleteProductByModel).toHaveBeenCalledTimes(1);
            expect(ProductDAO.prototype.deleteProductByModel).toHaveBeenCalledWith(testModel);

        });

    });

})
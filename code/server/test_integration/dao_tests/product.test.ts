import ProductDAO from "../../src/dao/productDAO";
import { beforeEach, afterEach, beforeAll, describe, expect, jest, test } from "@jest/globals";
import { cleanup } from "../../src/db/cleanup_custom";
import { Category, Product } from "../../src/components/product";
import { LowProductStockError, ProductAlreadyExistsError, ProductNotFoundError, ProductSoldError } from "../../src/errors/productError";
import { DateError, Time } from "../../src/utilities";
import exp from "constants";
import { error } from "console";


describe("ProductDAO tests:", () => {

    describe("createProduct test:", () => { 

        let productDAO: ProductDAO;

        beforeAll(async () => {
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

        test("create product that is already existing", async () => {

            const err = new ProductAlreadyExistsError();
            const testProduct  = new Product(12, "TestModel", Category.SMARTPHONE, "2024-04-02", "TestDetails", 12);

           await productDAO.createProduct(
                testProduct.model,
                testProduct.category,
                testProduct.quantity, 
                testProduct.details, 
                testProduct.sellingPrice, 
                testProduct.arrivalDate
            );

            
            await expect(productDAO.createProduct(
                testProduct.model,
                testProduct.category,
                testProduct.quantity, 
                testProduct.details, 
                testProduct.sellingPrice, 
                testProduct.arrivalDate
            )).rejects.toThrow(err);


        });

        test("create a product succesfully", async () => {
            const testProduct  = new Product(12, "TestModel", Category.SMARTPHONE, "2024-04-02", "TestDetails", 12);

            const testProduct2  = new Product(12, "TestModel1", Category.SMARTPHONE, "2024-04-02", "TestDetails", 12);


            await productDAO.createProduct(
                testProduct.model,
                testProduct.category,
                testProduct.quantity, 
                testProduct.details, 
                testProduct.sellingPrice, 
                testProduct.arrivalDate
            );

            const result = await productDAO.createProduct(
                testProduct2.model,
                testProduct2.category,
                testProduct2.quantity, 
                testProduct2.details, 
                testProduct2.sellingPrice, 
                testProduct2.arrivalDate
            );

            expect(result).toBeUndefined();
            
        });

    });

    describe("existProducts tests", () => {

        let productDAO: ProductDAO;

        beforeAll(async () => {
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

        test("return true if a product exists", async () => {

            const testProduct  = new Product(12, "TestModel", Category.SMARTPHONE, "2024-04-02", "TestDetails", 12);

            await productDAO.createProduct(
                 testProduct.model,
                 testProduct.category,
                 testProduct.quantity, 
                 testProduct.details, 
                 testProduct.sellingPrice, 
                 testProduct.arrivalDate
            );

            const result = await productDAO.existsProduct(testProduct.model);

            expect(result).toBe(true);
        
        });

        test("return false if a product does not exists", async () => {

            const testProduct  = new Product(12, "TestModel", Category.SMARTPHONE, "2024-04-02", "TestDetails", 12);

            const testModelNotExists = "Unknown model" 
            await productDAO.createProduct(
                 testProduct.model,
                 testProduct.category,
                 testProduct.quantity, 
                 testProduct.details, 
                 testProduct.sellingPrice, 
                 testProduct.arrivalDate
            );

            const result = await productDAO.existsProduct(testModelNotExists);

            expect(result).toBe(false);
        
        });

    });


    describe("getProductByModel tests", () => {

        let productDAO: ProductDAO;

        beforeAll(async () => {
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

        test("It should return the product searched, if it exists", async () => {

            const testProduct  = new Product(12, "TestModel", Category.SMARTPHONE, "2024-04-02", "TestDetails", 12);

            await productDAO.createProduct(
                 testProduct.model,
                 testProduct.category,
                 testProduct.quantity, 
                 testProduct.details, 
                 testProduct.sellingPrice, 
                 testProduct.arrivalDate
            );

            const result = await productDAO.getProductByModel(testProduct.model);

            expect(result).toStrictEqual(testProduct);

        });

        test("if model does not exist it should trhow an error", async () => {

            const err = new ProductNotFoundError();

            await expect(productDAO.getProductByModel("Unknown")).rejects.toThrow(err);

        });

    });


    describe("increaseQuantity Test:",  () => {
      
        let productDAO: ProductDAO;

        beforeAll(async () => {
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

        test("it should increase the quantity of a selected product", async ()=> {

            const testProduct  = new Product(12, "TestModel", Category.SMARTPHONE, "2024-04-02", "TestDetails", 12);

            await productDAO.createProduct(
                 testProduct.model,
                 testProduct.category,
                 testProduct.quantity, 
                 testProduct.details, 
                 testProduct.sellingPrice, 
                 testProduct.arrivalDate
            );

            const newQuantity = 10
            const expectedQuantity = testProduct.quantity + newQuantity;

            const todayDate = Time.today();

            const result = await productDAO.increaseQuantity(testProduct.model, newQuantity, todayDate);

            expect(result).toBe(expectedQuantity);

        });

        test("The changeDate has to be after the arrivalDate", async ()=> {

            const testProduct  = new Product(12, "TestModel", Category.SMARTPHONE, "2024-04-02", "TestDetails", 12);

            const err = new DateError();

            await productDAO.createProduct(
                 testProduct.model,
                 testProduct.category,
                 testProduct.quantity, 
                 testProduct.details, 
                 testProduct.sellingPrice, 
                 testProduct.arrivalDate
            );

            const newQuantity = 10;

            const pastDate = "2024-04-01";

            await expect(productDAO.increaseQuantity(testProduct.model, newQuantity, pastDate)).rejects.toThrow(err);

        });

        test("if model does not exist it should trhow an error", async () => {

            const err = new ProductNotFoundError();

            await expect(productDAO.increaseQuantity("Unknown", 10 , "2024-04-04")).rejects.toThrow(err);

        });


    });


    describe("decreaseQuantity test:", () => {

        let productDAO: ProductDAO;

        beforeAll(async () => {
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});


        test("it should return the new quantity after the decrease", async () => {

            const testProduct  = new Product(12, "TestModel", Category.SMARTPHONE, "2024-04-02", "TestDetails", 12);

            await productDAO.createProduct(
                 testProduct.model,
                 testProduct.category,
                 testProduct.quantity, 
                 testProduct.details, 
                 testProduct.sellingPrice, 
                 testProduct.arrivalDate
            );

            const soldQuantity = 10
            const expectedQuantity = testProduct.quantity - soldQuantity;

            const todayDate = Time.today();

            const result = await productDAO.decreaseQuantity(testProduct.model, soldQuantity, todayDate);

            expect(result).toBe(expectedQuantity);

        })

        test("The sellingDate has to be after the arrivalDate", async ()=> {

            const testProduct  = new Product(12, "TestModel", Category.SMARTPHONE, "2024-04-02", "TestDetails", 15);

            const err = new DateError();

            await productDAO.createProduct(
                 testProduct.model,
                 testProduct.category,
                 testProduct.quantity, 
                 testProduct.details, 
                 testProduct.sellingPrice, 
                 testProduct.arrivalDate
            );

            const soldQuantity = 10

            const pastDate = "2024-04-01";

            await expect(productDAO.decreaseQuantity(testProduct.model, soldQuantity, pastDate)).rejects.toThrow(err);

        });

        test("The quantity of the product to sell has to be greater than 0", async () => {

            const testProduct  = new Product(12, "TestModel", Category.SMARTPHONE, "2024-04-02", "TestDetails", 0);

            const err = new ProductSoldError();

            await productDAO.createProduct(
                testProduct.model,
                testProduct.category,
                testProduct.quantity, 
                testProduct.details, 
                testProduct.sellingPrice, 
                testProduct.arrivalDate
           );

            const soldQuantity = 10

            const sellingDate = "2024-04-10";

            await expect(productDAO.decreaseQuantity(testProduct.model, soldQuantity, sellingDate)).rejects.toThrow(err);

        });

        test("The quantity to sell cant be greater than the available quantity", async () => {

            const testProduct  = new Product(12, "TestModel", Category.SMARTPHONE, "2024-04-02", "TestDetails", 5);

            const err = new LowProductStockError();

            await productDAO.createProduct(
                testProduct.model,
                testProduct.category,
                testProduct.quantity, 
                testProduct.details, 
                testProduct.sellingPrice, 
                testProduct.arrivalDate
           );

            const soldQuantity = 10

            const date = "2024-04-10";

            await expect(productDAO.decreaseQuantity(testProduct.model, soldQuantity, date)).rejects.toThrow(err);

        });


        test("if model does not exist it should trhow an error", async () => {

            const err = new ProductNotFoundError();

            await expect(productDAO.decreaseQuantity("Unknown", 10 , "2024-04-04")).rejects.toThrow(err);

        });


    });


    describe("getAllProducts test", () => {

        let productDAO: ProductDAO;

        beforeAll(async () => {
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

        test("Return all products present on db", async ()=> {

            const testProduct1  = new Product(12, "TestModel1", Category.SMARTPHONE, "2024-04-02", "TestDetails", 10);
            const testProduct2  = new Product(12, "TestModel2", Category.LAPTOP, "2024-04-02", "TestDetails", 10);
            const testProduct3  = new Product(12, "TestModel3", Category.APPLIANCE, "2024-04-02", "TestDetails", 10);

            const testProducts: Product[] = [testProduct1, testProduct2, testProduct3];

            await productDAO.createProduct(
                testProduct1.model,
                testProduct1.category,
                testProduct1.quantity, 
                testProduct1.details, 
                testProduct1.sellingPrice, 
                testProduct1.arrivalDate
            );

            await productDAO.createProduct(
                testProduct2.model,
                testProduct2.category,
                testProduct2.quantity, 
                testProduct2.details, 
                testProduct2.sellingPrice, 
                testProduct2.arrivalDate
            );

            await productDAO.createProduct(
                testProduct3.model,
                testProduct3.category,
                testProduct3.quantity, 
                testProduct3.details, 
                testProduct3.sellingPrice, 
                testProduct3.arrivalDate
           );


           const result = await productDAO.getAllProducts("","","");

           expect(result).toStrictEqual(testProducts);
           

        });


        test("Return all products selected by Model", async ()=> {

            const testProduct1  = new Product(12, "TestModel1", Category.SMARTPHONE, "2024-04-02", "TestDetails", 10);
            const testProduct2  = new Product(12, "TestModel2", Category.LAPTOP, "2024-04-02", "TestDetails", 10);
            const testProduct3  = new Product(12, "TestModel3", Category.APPLIANCE, "2024-04-02", "TestDetails", 10);

            const testProducts = [testProduct1, testProduct2, testProduct3];

            const testProductsFiltered: Product[] = [testProduct1];

            await productDAO.createProduct(
                testProduct1.model,
                testProduct1.category,
                testProduct1.quantity, 
                testProduct1.details, 
                testProduct1.sellingPrice, 
                testProduct1.arrivalDate
            );

            await productDAO.createProduct(
                testProduct2.model,
                testProduct2.category,
                testProduct2.quantity, 
                testProduct2.details, 
                testProduct2.sellingPrice, 
                testProduct2.arrivalDate
            );

            await productDAO.createProduct(
                testProduct3.model,
                testProduct3.category,
                testProduct3.quantity, 
                testProduct3.details, 
                testProduct3.sellingPrice, 
                testProduct3.arrivalDate
           );


           const result = await productDAO.getAllProducts("model","","TestModel1");

           expect(result).toStrictEqual(testProductsFiltered);
        
        });

        test("reject error if selected Model does not exists ", async ()=> {

            const testProduct1  = new Product(12, "TestModel1", Category.SMARTPHONE, "2024-04-02", "TestDetails", 10);
            const testProduct2  = new Product(12, "TestModel2", Category.LAPTOP, "2024-04-02", "TestDetails", 10);
            const testProduct3  = new Product(12, "TestModel3", Category.APPLIANCE, "2024-04-02", "TestDetails", 10);

            const testProducts: Product[] = [testProduct1, testProduct2, testProduct3];

            const err = new ProductNotFoundError();

            await productDAO.createProduct(
                testProduct1.model,
                testProduct1.category,
                testProduct1.quantity, 
                testProduct1.details, 
                testProduct1.sellingPrice, 
                testProduct1.arrivalDate
            );

            await productDAO.createProduct(
                testProduct2.model,
                testProduct2.category,
                testProduct2.quantity, 
                testProduct2.details, 
                testProduct2.sellingPrice, 
                testProduct2.arrivalDate
            );

            await productDAO.createProduct(
                testProduct3.model,
                testProduct3.category,
                testProduct3.quantity, 
                testProduct3.details, 
                testProduct3.sellingPrice, 
                testProduct3.arrivalDate
           );


           await expect(productDAO.getAllProducts("model","","NotExistingModel")).rejects.toThrow(err);
        
        });


        test("Return all products selected by Category", async ()=> {

            const testProduct1  = new Product(12, "TestModel1", Category.SMARTPHONE, "2024-04-02", "TestDetails", 10);
            const testProduct2  = new Product(12, "TestModel2", Category.LAPTOP, "2024-04-02", "TestDetails", 10);
            const testProduct3  = new Product(12, "TestModel3", Category.LAPTOP, "2024-04-02", "TestDetails", 10);

            const testProducts: Product[] = [testProduct1, testProduct2, testProduct3];

            const testProductsFiltered: Product[] = [testProduct2, testProduct3];

            await productDAO.createProduct(
                testProduct1.model,
                testProduct1.category,
                testProduct1.quantity, 
                testProduct1.details, 
                testProduct1.sellingPrice, 
                testProduct1.arrivalDate
            );

            await productDAO.createProduct(
                testProduct2.model,
                testProduct2.category,
                testProduct2.quantity, 
                testProduct2.details, 
                testProduct2.sellingPrice, 
                testProduct2.arrivalDate
            );

            await productDAO.createProduct(
                testProduct3.model,
                testProduct3.category,
                testProduct3.quantity, 
                testProduct3.details, 
                testProduct3.sellingPrice, 
                testProduct3.arrivalDate
           );


           const result = await productDAO.getAllProducts("category","Laptop","");

           expect(result).toStrictEqual(testProductsFiltered);
        
        });

    
    });


    describe("getAllAvailableProducts tets:", () => {

        let productDAO: ProductDAO;

        beforeAll(async () => {
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

        test("It should return all products with quantity > 0", async () => {

            const testProduct1  = new Product(12, "TestModel1", Category.SMARTPHONE, "2024-04-02", "TestDetails", 10);
            const testProduct2  = new Product(12, "TestModel2", Category.LAPTOP, "2024-04-02", "TestDetails", 10);
            const testProduct3  = new Product(12, "TestModel3", Category.APPLIANCE, "2024-04-02", "TestDetails", 2);
            const testProduct4  = new Product(12, "TestModel4", Category.SMARTPHONE, "2024-04-02", "TestDetails", 0);


            const testAvailableProducts: Product[] = [testProduct1, testProduct2, testProduct3];

            await productDAO.createProduct(
                testProduct1.model,
                testProduct1.category,
                testProduct1.quantity, 
                testProduct1.details, 
                testProduct1.sellingPrice, 
                testProduct1.arrivalDate
            );

            await productDAO.createProduct(
                testProduct2.model,
                testProduct2.category,
                testProduct2.quantity, 
                testProduct2.details, 
                testProduct2.sellingPrice, 
                testProduct2.arrivalDate
            );

            await productDAO.createProduct(
                testProduct3.model,
                testProduct3.category,
                testProduct3.quantity, 
                testProduct3.details, 
                testProduct3.sellingPrice, 
                testProduct3.arrivalDate
            ); 

            await productDAO.createProduct(
                testProduct4.model,
                testProduct4.category,
                testProduct4.quantity, 
                testProduct4.details, 
                testProduct4.sellingPrice, 
                testProduct4.arrivalDate
            );

           const result = await productDAO.getAllAvailableProducts("", "", "");

           expect(result).toStrictEqual(testAvailableProducts);


        });

        test("It should return all available products filtered by model", async () => {

            const testProduct1  = new Product(12, "TestModel1", Category.SMARTPHONE, "2024-04-02", "TestDetails", 10);
            const testProduct2  = new Product(12, "TestModel2", Category.LAPTOP, "2024-04-02", "TestDetails", 10);
            const testProduct3  = new Product(12, "TestModel3", Category.APPLIANCE, "2024-04-02", "TestDetails", 2);
            const testProduct4  = new Product(12, "TestModel4", Category.SMARTPHONE, "2024-04-02", "TestDetails", 0);


            const testAvailableProductFiltered: Product[]= [testProduct3];

            await productDAO.createProduct(
                testProduct1.model,
                testProduct1.category,
                testProduct1.quantity, 
                testProduct1.details, 
                testProduct1.sellingPrice, 
                testProduct1.arrivalDate
            );

            await productDAO.createProduct(
                testProduct2.model,
                testProduct2.category,
                testProduct2.quantity, 
                testProduct2.details, 
                testProduct2.sellingPrice, 
                testProduct2.arrivalDate
            );

            await productDAO.createProduct(
                testProduct3.model,
                testProduct3.category,
                testProduct3.quantity, 
                testProduct3.details, 
                testProduct3.sellingPrice, 
                testProduct3.arrivalDate
            ); 

            await productDAO.createProduct(
                testProduct4.model,
                testProduct4.category,
                testProduct4.quantity, 
                testProduct4.details, 
                testProduct4.sellingPrice, 
                testProduct4.arrivalDate
            );

           const result = await productDAO.getAllAvailableProducts("model", "", "TestModel3");

           expect(result).toStrictEqual(testAvailableProductFiltered);

        });

        test("It should return all available products filtered by model - but a model selected is not aveilable", async () => {

            const testProduct1  = new Product(12, "TestModel1", Category.SMARTPHONE, "2024-04-02", "TestDetails", 10);
            const testProduct2  = new Product(12, "TestModel2", Category.LAPTOP, "2024-04-02", "TestDetails", 10);
            const testProduct3  = new Product(12, "TestModel3", Category.APPLIANCE, "2024-04-02", "TestDetails", 2);
            const testProduct4  = new Product(12, "TestModel4", Category.SMARTPHONE, "2024-04-02", "TestDetails", 0);
           
            const testAvailableProductFiltered: Product[] = [];

            await productDAO.createProduct(
                testProduct1.model,
                testProduct1.category,
                testProduct1.quantity, 
                testProduct1.details, 
                testProduct1.sellingPrice, 
                testProduct1.arrivalDate
            );

            await productDAO.createProduct(
                testProduct2.model,
                testProduct2.category,
                testProduct2.quantity, 
                testProduct2.details, 
                testProduct2.sellingPrice, 
                testProduct2.arrivalDate
            );

            await productDAO.createProduct(
                testProduct3.model,
                testProduct3.category,
                testProduct3.quantity, 
                testProduct3.details, 
                testProduct3.sellingPrice, 
                testProduct3.arrivalDate
            ); 

            await productDAO.createProduct(
                testProduct4.model,
                testProduct4.category,
                testProduct4.quantity, 
                testProduct4.details, 
                testProduct4.sellingPrice, 
                testProduct4.arrivalDate
            );

           const result = await productDAO.getAllAvailableProducts("model", "", "TestModel4");

           expect(result).toStrictEqual(testAvailableProductFiltered);

        });

        test("reject error if selected Model does not exists ", async ()=> {

            const testProduct1  = new Product(12, "TestModel1", Category.SMARTPHONE, "2024-04-02", "TestDetails", 10);
            const testProduct2  = new Product(12, "TestModel2", Category.LAPTOP, "2024-04-02", "TestDetails", 10);
            const testProduct3  = new Product(12, "TestModel3", Category.APPLIANCE, "2024-04-02", "TestDetails", 2);
           
            const testAvailableProductFiltered = [];

            const err = new ProductNotFoundError();

            await productDAO.createProduct(
                testProduct1.model,
                testProduct1.category,
                testProduct1.quantity, 
                testProduct1.details, 
                testProduct1.sellingPrice, 
                testProduct1.arrivalDate
            );

            await productDAO.createProduct(
                testProduct2.model,
                testProduct2.category,
                testProduct2.quantity, 
                testProduct2.details, 
                testProduct2.sellingPrice, 
                testProduct2.arrivalDate
            );

            await productDAO.createProduct(
                testProduct3.model,
                testProduct3.category,
                testProduct3.quantity, 
                testProduct3.details, 
                testProduct3.sellingPrice, 
                testProduct3.arrivalDate
            ); 

            await expect(productDAO.getAllAvailableProducts("model", "", "TestModel4")).rejects.toThrow(err);

        });

        test("It should return all available products filtered by Category", async () => {

            const testProduct1  = new Product(12, "TestModel1", Category.SMARTPHONE, "2024-04-02", "TestDetails", 10);
            const testProduct2  = new Product(12, "TestModel2", Category.LAPTOP, "2024-04-02", "TestDetails", 10);
            const testProduct3  = new Product(12, "TestModel3", Category.APPLIANCE, "2024-04-02", "TestDetails", 2);
            const testProduct4  = new Product(12, "TestModel4", Category.SMARTPHONE, "2024-04-02", "TestDetails", 0);
           
            const categoryFiltered = "Smartphone";
            const testAvailableProductFiltered = [testProduct1];

            await productDAO.createProduct(
                testProduct1.model,
                testProduct1.category,
                testProduct1.quantity, 
                testProduct1.details, 
                testProduct1.sellingPrice, 
                testProduct1.arrivalDate
            );

            await productDAO.createProduct(
                testProduct2.model,
                testProduct2.category,
                testProduct2.quantity, 
                testProduct2.details, 
                testProduct2.sellingPrice, 
                testProduct2.arrivalDate
            );

            await productDAO.createProduct(
                testProduct3.model,
                testProduct3.category,
                testProduct3.quantity, 
                testProduct3.details, 
                testProduct3.sellingPrice, 
                testProduct3.arrivalDate
            );
            
            await productDAO.createProduct(
                testProduct4.model,
                testProduct4.category,
                testProduct4.quantity, 
                testProduct4.details, 
                testProduct4.sellingPrice, 
                testProduct4.arrivalDate
            );

            const result = await productDAO.getAllAvailableProducts("category", categoryFiltered, "");

            expect(result).toEqual(testAvailableProductFiltered);


        });

    });


    describe("deleteProducts test:", () => {

        let productDAO: ProductDAO;

        beforeAll(async () => {
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

        test("deleting all products from db", async () => {

            const testProduct1  = new Product(12, "TestModel1", Category.SMARTPHONE, "2024-04-02", "TestDetails", 10);
            const testProduct2  = new Product(12, "TestModel2", Category.LAPTOP, "2024-04-02", "TestDetails", 10);
         
            await productDAO.createProduct(
                testProduct1.model,
                testProduct1.category,
                testProduct1.quantity, 
                testProduct1.details, 
                testProduct1.sellingPrice, 
                testProduct1.arrivalDate
            );

            await productDAO.createProduct(
                testProduct2.model,
                testProduct2.category,
                testProduct2.quantity, 
                testProduct2.details, 
                testProduct2.sellingPrice, 
                testProduct2.arrivalDate
            );


            const result = await productDAO.deleteProducts();

            expect(result).toBe(true);
        });

    });


    describe("deleteProductByModel tests:", () => {

        let productDAO: ProductDAO;

        beforeAll(async () => {
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});

        test("it should delete the selected model", async () => {

            const testProduct1  = new Product(12, "TestModel1", Category.SMARTPHONE, "2024-04-02", "TestDetails", 10);
            const testProduct2  = new Product(12, "TestModel2", Category.LAPTOP, "2024-04-02", "TestDetails", 10);
         
            await productDAO.createProduct(
                testProduct1.model,
                testProduct1.category,
                testProduct1.quantity, 
                testProduct1.details, 
                testProduct1.sellingPrice, 
                testProduct1.arrivalDate
            );

            await productDAO.createProduct(
                testProduct2.model,
                testProduct2.category,
                testProduct2.quantity, 
                testProduct2.details, 
                testProduct2.sellingPrice, 
                testProduct2.arrivalDate
            );

            const result = await productDAO.deleteProductByModel("TestModel1");
            expect(result).toBe(true);

        });

        test("it should reject an error if the model specified does not exists", async () => {

            const testProduct1  = new Product(12, "TestModel1", Category.SMARTPHONE, "2024-04-02", "TestDetails", 10);
            const testProduct2  = new Product(12, "TestModel2", Category.LAPTOP, "2024-04-02", "TestDetails", 10);
         
            const err = new ProductNotFoundError();

            await productDAO.createProduct(
                testProduct1.model,
                testProduct1.category,
                testProduct1.quantity, 
                testProduct1.details, 
                testProduct1.sellingPrice, 
                testProduct1.arrivalDate
            );

            await productDAO.createProduct(
                testProduct2.model,
                testProduct2.category,
                testProduct2.quantity, 
                testProduct2.details, 
                testProduct2.sellingPrice, 
                testProduct2.arrivalDate
            );

            await expect(productDAO.deleteProductByModel("TestModeUnknown")).rejects.toThrow(err);
    
        });


    });



    describe("getProductQuantity test:", () => {

        let productDAO: ProductDAO;

        beforeAll(async () => {
			productDAO = new ProductDAO();

			await cleanup();
		});

		afterEach(async () => {
			await cleanup();
		});
        
        test("it should return the product quantity", async () => {

            const testProduct1  = new Product(12, "TestModel1", Category.SMARTPHONE, "2024-04-02", "TestDetails", 10);
            
            await productDAO.createProduct(
                testProduct1.model,
                testProduct1.category,
                testProduct1.quantity, 
                testProduct1.details, 
                testProduct1.sellingPrice, 
                testProduct1.arrivalDate
            );


            const result = await productDAO.getProductQuantity("TestModel1");
            expect(result).toBe(testProduct1.quantity);

        });

    })
})
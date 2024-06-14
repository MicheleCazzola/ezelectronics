import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import ReviewController from "../../src/controllers/reviewController";
import { Role, User } from "../../src/components/user";
import ReviewDAO from "../../src/dao/reviewDAO";
import ProductDAO from "../../src/dao/productDAO";
import { ProductNotFoundError } from "../../src/errors/productError";
import { ProductReview } from "../../src/components/review";

jest.mock("../../src/dao/reviewDAO");

beforeEach(() => {
	jest.clearAllMocks();
});

const testuser = new User("testuser", "name", "Surname", Role.CUSTOMER, "", "");

describe("Add Review", () => {
	test("Valid", async () => {
		jest.spyOn(ReviewDAO.prototype, "addReview").mockResolvedValueOnce(
			undefined
		);
		jest.spyOn(ProductDAO.prototype, "existsProduct").mockResolvedValueOnce(
			true
		);

		const controller = new ReviewController();

		const result = await controller.addReview(
			"testmodel",
			testuser,
			5,
			"lorem ipsum"
		);
		expect(result).toBe(undefined);

		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(1);
		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledWith(
			"testmodel"
		);

		expect(ReviewDAO.prototype.addReview).toHaveBeenCalledTimes(1);
		expect(ReviewDAO.prototype.addReview).toHaveBeenCalledWith(
			"testmodel",
			"testuser",
			5,
			"lorem ipsum"
		);
	});

	test("Product Not Found", async () => {
		jest.spyOn(ProductDAO.prototype, "existsProduct").mockResolvedValueOnce(
			false
		);

		const controller = new ReviewController();

		await expect(
			controller.addReview("testmodel", testuser, 5, "lorem ipsum")
		).rejects.toThrow(ProductNotFoundError);

		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(1);
		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledWith(
			"testmodel"
		);

		expect(ReviewDAO.prototype.addReview).toHaveBeenCalledTimes(0);
	});
});

describe("Get Product Reviews", () => {
	test("Valid", async () => {
		const reviews = [
			new ProductReview("testmodel", "testuser", 5, "", "lorem ipsum"),
			new ProductReview("testmodel", "testuser2", 4, "", "lorem ipsum"),
		];

		jest.spyOn(
			ReviewDAO.prototype,
			"getProductReviews"
		).mockResolvedValueOnce(reviews);
		jest.spyOn(ProductDAO.prototype, "existsProduct").mockResolvedValueOnce(
			true
		);

		const controller = new ReviewController();

		const result = await controller.getProductReviews("testmodel");
		expect(result).toBe(reviews);

		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(1);
		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledWith(
			"testmodel"
		);

		expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledTimes(1);
		expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledWith(
			"testmodel"
		);
	});

	test("Product Not Found", async () => {
		jest.spyOn(ProductDAO.prototype, "existsProduct").mockResolvedValueOnce(
			false
		);

		const controller = new ReviewController();

		await expect(controller.getProductReviews("testmodel")).rejects.toThrow(
			ProductNotFoundError
		);

		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(1);
		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledWith(
			"testmodel"
		);

		expect(ReviewDAO.prototype.getProductReviews).toHaveBeenCalledTimes(0);
	});
});

describe("Delete All Reviews", () => {
	test("Valid", async () => {
		jest.spyOn(
			ReviewDAO.prototype,
			"deleteAllReviews"
		).mockResolvedValueOnce(undefined);
		const controller = new ReviewController();

		const result = await controller.deleteAllReviews();

		expect(ReviewDAO.prototype.deleteAllReviews).toHaveBeenCalledTimes(1);
		expect(result).toBe(undefined);
	});
});

describe("Delete Product Review", () => {
	test("Valid", async () => {
		jest.spyOn(ProductDAO.prototype, "existsProduct").mockResolvedValueOnce(
			true
		);
		jest.spyOn(ReviewDAO.prototype, "deleteReview").mockResolvedValueOnce(
			undefined
		);

		const controller = new ReviewController();
		const result = await controller.deleteReview("testmodel", testuser);
		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(1);

		expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledTimes(1);
		expect(result).toBe(undefined);
	});

	test("Product Not Found", async () => {
		jest.spyOn(ProductDAO.prototype, "existsProduct").mockResolvedValueOnce(
			false
		);
		jest.spyOn(ReviewDAO.prototype, "deleteReview");

		const controller = new ReviewController();
		expect(
			controller.deleteReview("notamodel", testuser)
		).rejects.toThrowError(ProductNotFoundError);

		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(1);

		expect(ReviewDAO.prototype.deleteReview).toHaveBeenCalledTimes(0);
	});
});

describe("Delete All Reviews of a Product", () => {
	test("Valid", async () => {
		jest.spyOn(ProductDAO.prototype, "existsProduct").mockResolvedValueOnce(
			true
		);
		jest.spyOn(
			ReviewDAO.prototype,
			"deleteReviewsOfProduct"
		).mockResolvedValueOnce(undefined);

		const controller = new ReviewController();
		const result = await controller.deleteReviewsOfProduct("testmodel");
		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(1);

		expect(
			ReviewDAO.prototype.deleteReviewsOfProduct
		).toHaveBeenCalledTimes(1);
		expect(result).toBe(undefined);
	});

	test("Product Not Found", async () => {
		jest.spyOn(ProductDAO.prototype, "existsProduct").mockResolvedValueOnce(
			false
		);
		jest.spyOn(ReviewDAO.prototype, "deleteReviewsOfProduct");

		const controller = new ReviewController();
		expect(
			controller.deleteReviewsOfProduct("notamodel")
		).rejects.toThrowError(ProductNotFoundError);

		expect(ProductDAO.prototype.existsProduct).toHaveBeenCalledTimes(1);

		expect(
			ReviewDAO.prototype.deleteReviewsOfProduct
		).toHaveBeenCalledTimes(0);
	});
});

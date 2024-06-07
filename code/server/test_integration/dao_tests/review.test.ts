import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import crypto from "crypto";

import ReviewDAO from "../../src/dao/reviewDAO";
import { cleanup } from "../../src/db/cleanup";
import db from "../../src/db/db";
import { ProductNotFoundError } from "../../src/errors/productError";
import { ExistingReviewError } from "../../src/errors/reviewError";
import ProductDAO from "../../src/dao/productDAO";
import UserDAO from "../../src/dao/userDAO";

const pdao = new ProductDAO();
const udao = new UserDAO();

beforeAll(async () => {
  await cleanup();
  await pdao.createProduct(
    "testmodel",
    "Laptop",
    100,
    "testdetails",
    10,
    "2021-01-01"
  );
  await udao.createUser("testuser", "a", "b", "password", "Customer");
});

beforeEach(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
});

const dao = new ReviewDAO();

describe.skip("DAO - Add a Review", () => {
  test("Product Not Found", async () => {
    const testCase = {
      input: {
        model: "notamodel",
        username: "testuser",
        score: 5,
        comment: "Lorem Ipsum",
      },
      expected: ProductNotFoundError,
    };
    jest.spyOn(db, "run");
    try {
      await dao.addReview(
        testCase.input.model,
        testCase.input.username,
        testCase.input.score,
        testCase.input.comment
      );
    } catch (err) {
      expect(err).toBeInstanceOf(testCase.expected);
    }

    expect(db.run).toBeCalledTimes(1);
    expect(db.run).toBeCalledWith(
      expect.any(String), // sql query
      expect.arrayContaining([
        testCase.input.username,
        testCase.input.model,
        expect.any(String), // date
        testCase.input.comment,
        testCase.input.score,
      ]),
      expect.any(Function)
    );
  });

  test("Valid", async () => {
    const testCase = {
      input: {
        model: "testmodel",
        username: "testuser",
        score: 5,
        comment: "Lorem Ipsum",
      },
      expected: undefined as void,
    };
    jest.spyOn(db, "run");
    const result = await dao.addReview(
      testCase.input.model,
      testCase.input.username,
      testCase.input.score,
      testCase.input.comment
    );

    expect(result).toBe(testCase.expected);
    expect(db.run).toBeCalledTimes(1);
    expect(db.run).toBeCalledWith(
      expect.any(String), // sql query
      expect.arrayContaining([
        testCase.input.username,
        testCase.input.model,
        expect.any(String), // date
        testCase.input.comment,
        testCase.input.score,
      ]),
      expect.any(Function)
    );
  });

  test("Review Already Exist", async () => {
    const testCase = {
      input: {
        model: "testmodel",
        username: "testuser",
        score: 5,
        comment: "Lorem Ipsum",
      },
      expected: ExistingReviewError,
    };
    jest.spyOn(db, "run");
    try {
      await dao.addReview(
        testCase.input.model,
        testCase.input.username,
        testCase.input.score,
        testCase.input.comment
      );
    } catch (err) {
      expect(err).toBeInstanceOf(testCase.expected);
    }

    expect(db.run).toBeCalledTimes(1);
    expect(db.run).toBeCalledWith(
      expect.any(String), // sql query
      expect.arrayContaining([
        testCase.input.username,
        testCase.input.model,
        expect.any(String), // date
        testCase.input.comment,
        testCase.input.score,
      ]),
      expect.any(Function)
    );
  });
});

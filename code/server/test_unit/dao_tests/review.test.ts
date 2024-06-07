import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import db from "../../src/db/db";
import { Database } from "sqlite3";
import ReviewDAO from "../../src/dao/reviewDAO";
import { ProductNotFoundError } from "../../src/errors/productError";
import {
  ExistingReviewError,
  NoReviewProductError,
} from "../../src/errors/reviewError";
import { ProductReview } from "../../src/components/review";
import ProductDAO from "../../src/dao/productDAO";

jest.mock("../../src/dao/productDAO");

beforeEach(() => {
  jest.clearAllMocks();
});

const dao = new ReviewDAO();

describe("DAO - Add a Review", () => {
  const testCases = [
    {
      description: "Valid",
      db_result: null as Error | null,
      expected: undefined as void,
      model: "testmodel",
      username: "testuser",
      score: 5,
      comment: "lorem ipsum",
    },
    {
      description: "Product Not Found",
      db_result: {
        message: "FOREIGN KEY constraint failed",
        name: "",
        stack: undefined,
      } as Error,
      expected: ProductNotFoundError,
      model: "notavalidmodel",
      username: "testuser",
      score: 5,
      comment: "lorem ipsum",
    },
    {
      description: "Review Already Exists",
      db_result: {
        message: "",
        name: "PRIMARY KEY constraint failed",
        stack: undefined,
      } as Error,
      expected: ExistingReviewError,
      model: "testmodel",
      username: "testuser",
      score: 5,
      comment: "lorem ipsum",
    },
  ];

  for (const testCase of testCases) {
    test(testCase.description, async () => {
      jest.spyOn(db, "run").mockImplementationOnce((query, values, cb) => {
        cb(testCase.db_result);
        return {} as Database;
      });

      try {
        const result = await dao.addReview(
          testCase.model,
          testCase.username,
          testCase.score,
          testCase.comment
        );

        expect(result).toBe(testCase.expected);
      } catch (err) {
        expect(err).toBeInstanceOf(testCase.expected);
      }
      expect(db.run).toBeCalledTimes(1);
      expect(db.run).toBeCalledWith(
        expect.any(String), // sql query
        expect.arrayContaining([
          testCase.username,
          testCase.model,
          expect.any(String), // date
          testCase.comment,
          testCase.score,
        ]),
        expect.any(Function)
      );
    });
  }
});

describe("DAO - Get Product's Reviews", () => {
  const testCase = {
    description: "Valid",
    db_result: {
      err: null as Error | null,
      rows: [
        {
          model: "testmodel",
          user: "testuser",
          score: 5,
          date: "2021-01-01",
          comment: "lorem ipsum",
        },
        {
          model: "testmodel",
          user: "testuser2",
          score: 5,
          date: "2021-01-01",
          comment: "lorem ipsum",
        },
      ],
    },
    model: "testmodel",
    expected: [
      new ProductReview(
        "testmodel",
        "testuser",
        5,
        "2021-01-01",
        "lorem ipsum"
      ),
      new ProductReview(
        "testmodel",
        "testuser2",
        5,
        "2021-01-01",
        "lorem ipsum"
      ),
    ],
  };

  test(testCase.description, async () => {
    jest.spyOn(db, "all").mockImplementationOnce((query, values, cb) => {
      cb(testCase.db_result.err, testCase.db_result.rows);
      return {} as Database;
    });

    const result = await dao.getProductReviews(testCase.model);
    expect(result).toStrictEqual(testCase.expected);

    expect(db.all).toBeCalledTimes(1);
    expect(db.all).toBeCalledWith(
      expect.any(String), // sql query
      expect.arrayContaining([testCase.model]),
      expect.any(Function)
    );
  });

  const testCase2 = {
    description: "Product Not Found",
    db_result: {
      err: null as Error | null,
      rows: [] as any[],
    },
    model: "notamodel",
    expected: ProductNotFoundError,
  };
  test(testCase2.description, async () => {
    jest.spyOn(db, "all").mockImplementationOnce((query, values, cb) => {
      cb(testCase2.db_result.err, testCase2.db_result.rows);
      return {} as Database;
    });

    try {
      await dao.getProductReviews(testCase2.model);
    } catch (err) {
      console.log(err);
      expect(err).toBeInstanceOf(testCase2.expected);
    }
    expect(db.all).toBeCalledTimes(1);
    expect(db.all).toBeCalledWith(
      expect.any(String), // sql query
      expect.arrayContaining([testCase2.model]),
      expect.any(Function)
    );
  });
});

describe("DAO - Delete a Review", () => {
  const testCase = {
    model: "testmodel",
    user: "testuser",
    expected: undefined as void,
  };

  test("Valid", async () => {
    jest
      .spyOn(ProductDAO.prototype, "existsProduct")
      .mockResolvedValueOnce(true);

    jest.spyOn(db, "run").mockImplementationOnce(function (query, values, cb) {
      cb.call({ changes: 1 }, null);
      return {} as Database;
    });

    const result = await dao.deleteReview(testCase.model, testCase.user);
    expect(result).toBe(testCase.expected);

    expect(db.run).toBeCalledTimes(1);
    expect(db.run).toBeCalledWith(
      expect.any(String), // sql query
      expect.arrayContaining([testCase.model, testCase.user]),
      expect.any(Function)
    );
  });

  const testCase2 = {
    model: "testmodel",
    user: "testuser",
    expected: ProductNotFoundError,
  };
  test.skip("Product Not Found", async () => {
    jest
      .spyOn(ProductDAO.prototype, "existsProduct")
      .mockResolvedValueOnce(false);

    jest.spyOn(db, "run");

    expect(dao.deleteReview(testCase2.model, testCase2.user)).rejects.toThrow(
      testCase2.expected
    );

    expect(db.run).toBeCalledTimes(0);
  });

  const testCase3 = {
    model: "testmodel",
    user: "testuser",
    expected: NoReviewProductError,
  };
  test("Review Not Found", async () => {
    jest.spyOn(ProductDAO.prototype, "existsProduct").mockReset();
    jest
      .spyOn(ProductDAO.prototype, "existsProduct")
      .mockResolvedValueOnce(true);

    jest.spyOn(db, "run").mockImplementationOnce((query, values, cb) => {
      cb.call({ changes: 0 }, new testCase3.expected());
      return {} as Database;
    });

    expect(dao.deleteReview(testCase3.model, testCase3.user)).rejects.toThrow(
      testCase3.expected
    );
    // Why does this fail?
    expect(db.run).toBeCalledTimes(1);
    expect(db.run).toBeCalledWith(
      expect.any(String), // sql query
      expect.arrayContaining([testCase3.model]),
      expect.any(Function)
    );
  });
});

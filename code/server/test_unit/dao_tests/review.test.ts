import { test, expect, jest, describe, beforeEach } from "@jest/globals";
import db from "../../src/db/db";
import { Database } from "sqlite3";
import ReviewDAO from "../../src/dao/reviewDAO";
import { ProductNotFoundError } from "../../src/errors/productError";
import { ExistingReviewError } from "../../src/errors/reviewError";

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
      //console.log(testCase.db_result);
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

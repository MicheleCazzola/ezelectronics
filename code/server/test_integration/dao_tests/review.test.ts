import { describe, test, expect, beforeEach, jest } from "@jest/globals";

import { cleanup } from "../../src/db/cleanup";
import ReviewDAO from "../../src/dao/reviewDAO";
import db from "../../src/db/db";
import { ProductNotFoundError } from "../../src/errors/productError";

beforeEach(() => {
  cleanup();
});

const dao = new ReviewDAO();

describe("DAO - Add a Review", () => {
  const testCases = [
    {
      description: "Valid",
      input: {
        model: "testmodel",
        username: "testuser",
        score: 5,
        comment: "Lorem Ipsum",
      },
      expected: ProductNotFoundError,
    },
  ];
  for (const testCase of testCases) {
    test(testCase.description, async () => {
      jest.spyOn(db, "run");
      try {
        const result = await dao.addReview(
          testCase.input.model,
          testCase.input.username,
          testCase.input.score,
          testCase.input.comment
        );

        expect(result).toBe(testCase.expected);
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
  }
});

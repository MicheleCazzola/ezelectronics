import db from "../db/db";
import { ExistingReviewError } from "../errors/reviewError";
import { NoReviewProductError } from "../errors/reviewError";
import { ProductReview } from "../components/review";
import { ProductNotFoundError } from "../errors/productError";
import { Time } from "../../src/utilities";

/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ReviewDAO {
	/**
	 * Queries the database for an insert operation into reviews table
	 * Constraint: model must exist in the database 
	 * @param model The model of the product to review
	 * @param username The username of the user who made the review
	 * @param score The score assigned to the product, in the range [1, 5]
	 * @param comment The comment made by the user
	 * @returns A Promise that resolves to nothing
	 */
	async addReview(
		model: string,
		username: string,
		score: number,
		comment: string
	): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				let today: string = Time.today();
				let query: string = `INSERT INTO REVIEW (Username, Model, Date, Comment, Score)
                                        VALUES (?, ?, ?, ?, ?)`;
				db.run(
					query,
					[username, model, today, comment, score],
					function (err: Error) {
						if (err) {
							// Only foreign key failure is due to missing model
							if (
								err.message.includes(
									"FOREIGN KEY constraint failed"
								)
							) {
								reject(new ProductNotFoundError());
							}
							// Primary key failure means that review has already been written
							else if (
								err.message.includes("UNIQUE constraint failed")
							) {
								reject(new ExistingReviewError());
							} else {
								reject(err);
							}
						} else {
							resolve();
						}
					}
				);
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Queries the database for a select operation on reviews table
	 * Constraint: model must exist in the database
	 * @param model The model of the product to get reviews from
	 */
	async getProductReviews(model: string): Promise<ProductReview[]> {
		return new Promise((resolve, reject) => {
			try {
				let query: string = "SELECT * FROM review WHERE Model = ?";
				db.all(
					query,
					[model],
					function (err: Error | null, rows: any[]) {
						if (err) {
							reject(err);
						}
						// Only if rows is empty is due to missing product
						else if (!rows) {
							// never happens, rows is [] at worst
							reject(new ProductNotFoundError());
						} else {
							let reviews: ProductReview[] = rows.map(
								(review) =>
									new ProductReview(
										review.Model,
										review.Username,
										review.Score,
										review.Date,
										review.Comment
									)
							);
							resolve(reviews);
						}
					}
				);
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Queries the database for a delete operation on reviews table,
	 * focused only on that made by the current user on products of
	 * the specified model
	 * Constraint: model must exist in the database
	 * @param model The model of the product to delete review from
	 * @param username The username of the user who made the review to delete
	 */
	async deleteReview(model: string, username: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				let query: string =
					"DELETE FROM review WHERE model = ? AND username = ?";
				db.run(query, [model, username], function (err: Error | null) {
					// Should not happen
					if (err) {
						reject(err);
					}

					// Check if at least one row (max exactly one) has
					// been affected by query: if no rows has been affected
					// by DELETE, then there are no reviews made by the current
					// user on products of the specified model
					else if (this.changes == 0) {
						reject(new NoReviewProductError());
					}

					// Nominal case: row is deleted
					else {
						resolve();
					}
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Queries the database for a delete operation on reviews table,
	 * focused only of those made on products of the specified model
	 * Constraint: model must exist in the database
	 * @param model The model of the products to delete reviews from
	 */
	async deleteReviewsOfProduct(model: string): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				let query: string = "DELETE FROM review WHERE model = ?";
				db.run(query, [model], function (err: Error | null) {
					// Should not happen
					if (err) {
						reject(err);
					} else {
						// Standard case
						resolve();
					}
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Queries the database for a delete operation on reviews table,
	 * focused on all of them, independently by user or product model
	 */
	async deleteAllReviews(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				let query = "DELETE FROM review";
				db.run(query, function (err: Error | null) {
					// Should not happen
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			} catch (error) {
				reject(error);
			}
		});
	}
}

export default ReviewDAO;

import dayjs from "dayjs"
import db from "../db/db";
import { ExistingReviewError } from "../errors/reviewError";
import { NoReviewProductError } from "../errors/reviewError";
import { ProductReview } from "../components/review";
import { ProductNotFoundError } from "../errors/productError";
import ProductDAO from "./productDAO";

/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ReviewDAO {
    /**
     * Queries the database for an insert operation into reviews table 
     * @param model The model of the product to review
     * @param username The username of the user who made the review
     * @param score The score assigned to the product, in the range [1, 5]
     * @param comment The comment made by the user
     * @returns A Promise that resolves to nothing
     */
    addReview(model: string, username: string, score: number, comment: string) : Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                let today: string = dayjs().format("YYYY-MM-DD");
                let query: string = `INSERT INTO REVIEW (Username, Model, Date, Comment, Score)
                                        VALUES (?, ?, ?, ?, ?)`;
                db.run(query, [username, model, today, comment, score], function(err: Error) {
                    if (err) {
                        //console.log(err);
                        console.log(`Name: ${err.name}`);
                        console.log(`Message: ${err.message}`);
                        console.log(`Error: ${err.stack}`);
                        
                        // Only foreign key failure is due to missing model
                        if (err.message.includes("FOREIGN KEY constraint failed")) {
                            reject(new NoReviewProductError);
                        }
                        // Primary key failure means that review has already been written 
                        else if (err.name.includes("PRIMARY KEY constraint failed")) {
                            reject(new ExistingReviewError);
                        }
                    } 
                    else {
                        resolve();
                    }
                });
            } catch (error) {
                //console.log(`Error caught: ${error}`);
                reject(error);
            }
        });
    }

    /**
     * Queries the database for a select operation on reviews table
     * @param model The model of the product to get reviews from
     */
    getProductReviews(model: string) : Promise<ProductReview[]> {
        return new Promise((resolve, reject) => {
            try {
                let query: string = "SELECT * FROM review WHERE model = ?";
                db.all(query, [model], function(err: Error | null, rows: any[]) {
                    if(err) {
                        reject(err);
                    }
                    let reviews = rows.map(review =>
                        new ProductReview(review.model, review.user, review.score,
                            review.date, review.comment));
                    resolve(reviews);
                });
            } catch (error) {
                reject(error);
            }
        })
    }

    /**
     * Queries the database for a delete operation on reviews table,
     * focused only on that made by the current user on products of
     * the specified model
     * @param model The model of the product to delete review from
     * @param username The username of the user who made the review to delete
     */
    deleteReview(model: string, username: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // CHECK IF MODEL IN DB (PRODUCT DESCRIPTOR)
                if ((new ProductDAO).existsProduct(model)) {
                    reject(new ProductNotFoundError);
                }

                let query: string = "DELETE FROM review WHERE model = ? AND username = ?";
                db.run(query, [model, username], function(err: Error | null) {

                    // Should not happen
                    if (err) {
                        reject(err);
                    }

                    // Check if at least one row (max exactly one) has
                    // been affected by query: if no rows has been affected
                    // by DELETE, then there are no reviews made by the current
                    // user on products of the specified model
                    if (this.changes == 0) {
                        reject(new NoReviewProductError);
                    }
                    
                    // Nominal case: row is deleted
                    resolve();
                })
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Queries the database for a delete operation on reviews table,
     * focused only of those made on products of the specified model
     * @param model The model of the products to delete reviews from 
     */
    deleteReviewsOfProduct(model: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // CHECK IF MODEL IN DB (PRODUCT DESCRIPTOR)
                if ((new ProductDAO).existsProduct(model)) {
                    reject(new ProductNotFoundError);
                }

                let query: string = "DELETE FROM review WHERE model = ?";
                db.run(query, [model], function(err: Error | null) {

                    // Should not happen
                    if(err) {
                        reject(err);
                    }

                    // Standard case
                    resolve();
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
    deleteAllReviews(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                let query = "DELETE FROM review";
                db.run(query, function(err: Error | null) {
                    // Should not happen
                    if(err) {
                        reject(err);
                    }
                    resolve();
                });
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default ReviewDAO;
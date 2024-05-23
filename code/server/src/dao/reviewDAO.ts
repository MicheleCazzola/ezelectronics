import { resolve } from "path";
import { User } from "../components/user";
import { rejects } from "assert";
import dayjs from "dayjs"
import db from "../db/db";
import { ExistingReviewError } from "../errors/reviewError";
import { NoReviewProductError } from "../errors/reviewError";

/**
 * A class that implements the interaction with the database for all review-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class ReviewDAO {
    async addReview(model: string, username: string, score: number, comment: string) : Promise<void> {
        return new Promise((resolve, reject) => {
            let today: string = dayjs().format("YYYY-MM-DD");
            let query: string = `INSERT INTO REVIEWS (Username, Model, Date, Comment, Score)
                                    VALUES (?, ?, ?, ?, ?)`;
            db.run(query, [username, model, today, comment, score], function(err: Error) {
                if (err) {
                    console.log(err);
                    if (err.name.includes("SQLITE_CONSTRAINT_PRIMARYKEY")) {
                        reject(new ExistingReviewError);
                    }
                    else if (err.name.includes("SQLITE_CONSTRAINT_FOREIGNKEY")) {
                        reject(new NoReviewProductError);
                    }
                    else {
                        reject(err);
                    }
                } 
                else {
                    resolve();
                }
            });
        });
    }
}

export default ReviewDAO;
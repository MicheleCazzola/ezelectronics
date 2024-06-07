import ProductDAO from "../dao/productDAO";
import { ProductReview } from "../components/review";
import { User } from "../components/user";
import ReviewDAO from "../dao/reviewDAO";
import { ProductNotFoundError } from "../errors/productError";

class ReviewController {
    private dao: ReviewDAO;
    private productDAO: ProductDAO;

    constructor() {
        this.dao = new ReviewDAO;
        this.productDAO = new ProductDAO;
    }

    /**
     * Adds a new review for a product
     * @param model The model of the product to review
     * @param user The user who made the review
     * @param score The score assigned to the product, in the range [1, 5]
     * @param comment The comment made by the user
     * @returns A Promise that resolves to nothing
     */
    async addReview(model: string, user: User, score: number, comment: string) : Promise<void> { 
        
        //console.log(`Model: ${model}, user: ${user.username}, score: ${score}, comment: ${comment}`);
        //console.log("Calling DAO...");

        

        return this.dao.addReview(model, user.username, score, comment);
    }

    /**
     * Returns all reviews for a product
     * @param model The model of the product to get reviews from
     * @returns A Promise that resolves to an array of ProductReview objects
     */
    async getProductReviews(model: string): Promise<ProductReview[]>  {
        return this.dao.getProductReviews(model);
     }

    /**
     * Deletes the review made by a user for a product
     * @param model The model of the product to delete the review from
     * @param user The user who made the review to delete
     * @returns A Promise that resolves to nothing
     */
    async deleteReview(model: string, user: User): Promise<void> {

        // Check if product exists in db
        let productExists = await this.productDAO.existsProduct(model);

        // If absent, throw custom error
        if (!productExists) {
            throw(new ProductNotFoundError());
        }

        // Otherwise, delete correlated review of current user
        return this.dao.deleteReview(model, user.username);
     }

    /**
     * Deletes all reviews for a product
     * @param model The model of the product to delete the reviews from
     * @returns A Promise that resolves to nothing
     */
    async deleteReviewsOfProduct(model: string): Promise<void> {
        // Check if product exists in db
        let productExists = await this.productDAO.existsProduct(model);

        // If absent, throw custom error
        if (!productExists) {
            throw(new ProductNotFoundError());
        }

        // Otherwise, delete all correlated reviews
        return this.dao.deleteReviewsOfProduct(model);
    }

    /**
     * Deletes all reviews of all products
     * @returns A Promise that resolves to nothing
     */
    async deleteAllReviews(): Promise<void> {
        return this.dao.deleteAllReviews();
    }
}

export default ReviewController;
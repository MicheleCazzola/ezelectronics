"use strict"

import db from "./db";

/**
 * Deletes all data from the database.
 * This function must be called before any integration test, to ensure a clean database state for each test run.
 */

/*
function cleanup_intern() {
    db.serialize(() => {
        // Delete all data from the database.
        db.run("DELETE FROM users");
        db.run("DELETE FROM cart");
        db.run("DELETE FROM product_descriptor");
        db.run("DELETE FROM product_in_cart");
        db.run("DELETE FROM review");
        db.run("DELETE FROM sqlite_sequence");
        //Add delete statements for other tables here
    });
}
*/

function cleanup_custom(): Promise<string> {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM PRODUCT_IN_CART", function(err: Error)  {
            const productInCartChanges = this.changes;
            if(!err) {
                db.run("DELETE FROM REVIEW", function(err: Error){
                    const reviewChanges = this.changes;
                    if(!err) {
                        db.run("DELETE FROM CART", function(err: Error) {
                            const cartChanges = this.changes;
                            if(!err) {
                                db.run("DELETE FROM PRODUCT_DESCRIPTOR", function(err: Error) {
                                    const productChanges = this.changes;
                                    if(!err) {
                                        db.run("DELETE FROM USERS", function(err: Error) {
                                            const usersChanges = this.changes;
                                            if(!err) {
                                                db.run("DELETE FROM SQLITE_SEQUENCE", function(err: Error) {
                                                    const sequenceChanges = this.changes;
                                                    if(!err) {
                                                        resolve(`DELETE COMPLETED
                                                            Users: ${usersChanges}
                                                            Cart: ${cartChanges}
                                                            Product: ${productChanges}
                                                            Product in cart: ${productInCartChanges}
                                                            Review: ${reviewChanges}
                                                            Sqlite sequence: ${sequenceChanges}`);
                                                    }
                                                    else {
                                                        reject(`Failed delete from SQLITE_SEQUENCE: ${err.message}`);
                                                    }
                                                });
                                            }   
                                            else {
                                                reject(`Failed delete from USERS: ${err.message}`);
                                            }
                                        });
                                    }
                                    else {
                                        reject(`Failed delete from PRODUCT_DESCRIPTOR: ${err.message}`);
                                    }
                                });
                            }
                            else {
                                reject(`Failed delete from CART: ${err.message}`);
                            }
                        });
                    }
                    else {
                        reject(`Failed delete from REVIEW: ${err.message}`);
                    }
                });
            }
            else {
                reject(`Failed to delete from PRODUCT_IN_CART: ${err.message}`);
            }
        });
    });
}

export async function cleanup() {
    return cleanup_custom();
}
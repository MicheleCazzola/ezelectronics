import {  UserNotFoundError, UserNotManagerError, UserNotCustomerError, UserAlreadyExistsError, UserNotAdminError, UserIsAdminError, UnauthorizedUserError, InvalidDateError } from "../errors/userError";
import { Role, User } from "../components/user"
import UserDAO from "../dao/userDAO"

/**
 * Represents a controller for managing users.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class UserController {
    private dao: UserDAO

    constructor() {
        this.dao = new UserDAO
    }

    /**
     * Creates a new user.
     * @param username - The username of the new user. It must not be null and it must not be already taken.
     * @param name - The name of the new user. It must not be null.
     * @param surname - The surname of the new user. It must not be null.
     * @param password - The password of the new user. It must not be null.
     * @param role - The role of the new user. It must not be null and it can only be one of the three allowed types ("Manager", "Customer", "Admin")
     * @returns A Promise that resolves to true if the user has been created.
     */
    async createUser(username: string, name: string, surname: string, password: string, role: string):Promise<Boolean> {
        //console.log("Creating user");
        return this.dao.createUser(username, name, surname, password, role);
    }

    /**
     * Returns all users.
     * @returns A Promise that resolves to an array of users.
     */
    async getUsers():Promise<User[]>{ 

        return this.dao.getUser();
    }

    /**
     * Returns all users with a specific role.
     * @param role - The role of the users to retrieve. It can only be one of the three allowed types ("Manager", "Customer", "Admin")
     * @returns A Promise that resolves to an array of users with the specified role.
     */
    async getUsersByRole(role: string): Promise<User[]>  {

        return this.dao.getUserByRole(role);

    }

    /**
     * Returns a specific user.
     * The function has different behavior depending on the role of the user calling it:
     * - Admins can retrieve any user
     * - Other roles can only retrieve their own information
     * @param username - The username of the user to retrieve. The user must exist.
     * @returns A Promise that resolves to the user with the specified username.
     */
    async getUserByUsername(user: User, username: string):Promise<User>{ 
    
        if(user.role !== "Admin"){
            //se l'utente non è admin può vedere solo le sue informazioni

            if(username !== user.username){
                //se il nome è diverso da quello dell'user che ha chiamato la route ->errore
                throw new UnauthorizedUserError();
            }

        }

        return this.dao.getUserByUsername(username);

    }


    /**
     * Deletes a specific user
     * The function has different behavior depending on the role of the user calling it:
     * - Admins can delete any non-Admin user
     * - Other roles can only delete their own account
     * @param username - The username of the user to delete. The user must exist.
     * @returns A Promise that resolves to true if the user has been deleted.
     */
    async deleteUser(user: User, username: string):Promise<Boolean> { 

    
        if(user.role !== "Admin"){
            //se l'utente non è admin può vedere solo le sue informazioni

            if(username !== user.username){
                //se il nome è diverso da quello dell'user che ha chiamato la route ->errore
                throw new UnauthorizedUserError();
            }

        }

        const userIsAdmin = await this.dao.isAdminByUsername(username);

        if(user.role === "Admin" && userIsAdmin){
            //Si evita che l'admin cancelli l'account di un altro admin
            throw new UserIsAdminError();
        }
        
        return this.dao.deleteUser(username);
    }

    /**
     * Deletes all non-Admin users
     * @returns A Promise that resolves to true if all non-Admin users have been deleted.
     */
    async deleteAll(): Promise<Boolean> { 
        return this.dao.deleteAll();
    }

    /**
     * Updates the personal information of one user. The user can only update their own information.
     * @param user The user who wants to update their information
     * @param name The new name of the user
     * @param surname The new surname of the user
     * @param address The new address of the user
     * @param birthdate The new birthdate of the user
     * @param username The username of the user to update. It must be equal to the username of the user parameter.
     * @returns A Promise that resolves to the updated user
     */
    async updateUserInfo(user: User, name: string, surname: string, address: string, birthdate: string, username: string):Promise<User> {
        
        //la data di nascita non deve essere dopo la data odierna
        const date = new Date(birthdate);
        const today = new Date();

       

        if(date > today) {
            throw new InvalidDateError();
        }

        if(user.role !== "Admin"){
            //se l'utente non è admin 

            if(username !== user.username){
                //e se il nome è diverso da quello dell'user che ha chiamato la route ->errore
                throw new UnauthorizedUserError();
            }

        }else if(user.role == "Admin"){
            //se l'utente è admin non può modificare altri utenti admin 
            const userToUpdate = await this.dao.getUserByUsername(username);
            if(userToUpdate.role == "Admin" && username !== user.username){
                throw new UnauthorizedUserError();
            }
    
        }


        return this.dao.updateUserInformation(name, surname, address, birthdate, username);

    }
}

export default UserController
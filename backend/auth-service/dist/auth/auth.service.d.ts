import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    register(registerDto: RegisterDto): Promise<{
        user: {
            _id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
        };
        token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            _id: import("mongoose").Types.ObjectId;
            name: string;
            email: string;
        };
        token: string;
    }>;
    private generateToken;
    validateToken(token: string): Promise<any>;
}

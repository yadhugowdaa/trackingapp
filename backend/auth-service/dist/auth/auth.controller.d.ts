import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
}

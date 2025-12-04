import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async register(registerDto: RegisterDto) {
        const { name, email, password } = registerDto;

        // Check if user already exists
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new this.userModel({
            name,
            email,
            password: hashedPassword,
        });

        await user.save();

        // Generate JWT token
        const token = this.generateToken(user._id.toString());

        return {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT token
        const token = this.generateToken(user._id.toString());

        return {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        };
    }

    private generateToken(userId: string): string {
        const secret = process.env.JWT_SECRET || 'ikykik_super_secret_key_2025';
        const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

        return jwt.sign({ userId }, secret, { expiresIn } as any);
    }

    async validateToken(token: string): Promise<any> {
        try {
            const secret = process.env.JWT_SECRET || 'ikykik_super_secret_key_2025';
            const decoded = jwt.verify(token, secret);
            return decoded;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}

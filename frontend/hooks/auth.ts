export interface AadharDetails {
    aadharNumber: string;
    name?: string;
    isVerified: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

class AuthService {

    private baseURL = process.env.API_BASE_URL || "http://localhost:3000";

    // fetch aadhar details using mobile number
    async getAadharByMobile(mobileNumber: string): Promise<ApiResponse<AadharDetails>> {
        try {
            const response = await fetch(`${this.baseURL}/api/get-aadhar/${mobileNumber}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            return {
                success: true,
                data: result.data,
                message: result.message
            };
        } catch (error) {
            console.error("error fetching aadhar details ", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred"
            };
        }
    }


    // send-otp to aadhar number
    async sendAadharOTP(aadharNumber: string): Promise<ApiResponse<{ otpSent: boolean }>> {
        try {
            const response = await fetch(`${this.baseURL}/api/send-aadhar-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ aadharNumber }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            return {
                success: true,
                data: result.data,
                message: result.message
            };
        } catch (error) {
            console.error("error sending aadhar OTP ", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "failed to send OTP"
            };
        }
    }


    // verify aadhar OTP
    async verifyAadharOTP(aadharNumber: string, otp: string): Promise<ApiResponse<{ verified: boolean }>> {
        try {
            const response = await fetch(`${this.baseURL}/api/verify-aadhar-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ aadharNumber, otp }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            return {
                success: true,
                data: result.data,
                message: result.message
            };
        } catch (error) {
            console.error("error sending aadhar OTP ", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "OTP verification failed."
            };
        }
    }

    // mock function for testing (remove when actual API is ready)
    async getMockAadharByMobile(mobileNumber: string): Promise<ApiResponse<AadharDetails>> {

        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockAadharNumbers: { [key: string]: AadharDetails } = {
            '9876543210': {
                aadharNumber: '1234 5678 9012',
                name: 'John Doe',
                isVerified: true
            },
            '1234567890': {
                aadharNumber: '9876 5432 1098',
                name: 'Jane Smith',
                isVerified: false
            }
        };

        const aadharDetails = mockAadharNumbers[mobileNumber] || {
            aadharNumber: "1111 2222 3333",
            name: "Default user",
            isVerified: false
        };

        return {
            success: true,
            data: aadharDetails,
            message: "Aadhar details fetched successfully."
        };
    }
}

export const authService = new AuthService();

export const {
    getAadharByMobile,
    sendAadharOTP,
    verifyAadharOTP,
    getMockAadharByMobile
} = authService;
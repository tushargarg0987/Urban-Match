import httpx

class OTPService:
    BASE_URL = "https://otp-service-beta.vercel.app/api/otp"

    @staticmethod
    def generate_otp(email: str, organization: str = "UrbanMatch", subject: str = "OTP Verification", otp_type: str = "numeric") -> dict:
        """
        Generate an OTP for the given email using the external OTP service.
        """
        url = f"{OTPService.BASE_URL}/generate"
        payload = {
            "email": email,
            "type": otp_type,
            "organization": organization,
            "subject": subject,
        }

        try:
            response = httpx.post(url, json=payload)
            if response.status_code == 200:
                return {"status": "success", "message": "OTP sent successfully"}
            return {"status": "error", "message": f"Failed to send OTP: {response.text}"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    @staticmethod
    def verify_otp(email: str, otp: str) -> dict:
        """
        Verify the OTP for the given email using the external OTP service.
        """
        url = f"{OTPService.BASE_URL}/verify"
        payload = {"email": email, "otp": otp}

        try:
            response = httpx.post(url, json=payload)
            if response.status_code == 200:
                return {"status": "success", "message": "OTP verified successfully"}
            return {"status": "error", "message": "Invalid or expired OTP"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

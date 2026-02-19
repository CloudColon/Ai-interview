class ServiceError(Exception):
    """
    Custom exception class for service layer errors.
    Raised when a service operation fails (e.g. not found, validation error).
    
    Usage:
        raise ServiceError("User not found", 404)
        return ServiceError("Invalid data", 400)
    """
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

    def to_dict(self):
        return {
            "error": self.message,
            "status_code": self.status_code
        }

    def __repr__(self):
        return f"<ServiceError {self.status_code}: {self.message}>"
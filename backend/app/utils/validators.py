"""Reusable field validators."""
from pydantic import field_validator


def validate_pincode(value: str) -> str:
    if not (value.isdigit() and len(value) == 6):
        raise ValueError("pincode must be a 6-digit number")
    return value


def validate_phone(value: str | None) -> str | None:
    if value is not None and not (value.isdigit() and 10 <= len(value) <= 12):
        raise ValueError("phone must contain 10-12 digits")
    return value


class PincodeValidator:
    @field_validator("pincode")
    @classmethod
    def _pincode(cls, v: str) -> str:
        return validate_pincode(v)


class PhoneValidator:
    @field_validator("phone")
    @classmethod
    def _phone(cls, v: str | None) -> str | None:
        return validate_phone(v)

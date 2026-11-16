import type { RestaurantFormData } from "../../../types/restaurant.ts";
import { isValidContactNumberFormat, isValidEmail } from "../../../utils/helper.ts";

export function validateRestaurantUpdate(
    restaurant: RestaurantFormData,
): string | null {
    if (!restaurant.restaurant_name.trim()) {
        return "Restaurant name is required.";
    }

    if (!restaurant.address.trim()) {
        return "Address is required.";
    }

    const email = restaurant.email.trim();
    if (!email) {
        return "Email is required.";
    }
    if (!isValidEmail(email)) {
        return "Enter a valid email address.";
    }

    const contactNumber = restaurant.contact_number.trim();
    if (!contactNumber) {
        return "Contact number is required.";
    }
    if (!isValidContactNumberFormat(contactNumber)) {
        return "Contact number contains invalid characters.";
    }

    const digitCount = contactNumber.replace(/\D/g, "").length;
    if (digitCount < 4 || digitCount > 15) {
        return "Contact number must contain between 4 and 15 digits.";
    }

    return null;
}

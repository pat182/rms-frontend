import type { RestaurantFormData } from "../../../types/restaurant.ts";
import { isValidContactNumberFormat, isValidEmail,days } from "../../../utils/helper.ts";

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
    const opHours = restaurant.configuration?.operating_hours
    if (!restaurant.configuration?.is_24_hours && opHours) {
        for (const oh of opHours) {
            if (oh.is_closed) continue;
            

            if (oh.opening_time && oh.closing_time){
                const [openHour, openMinute] = oh.opening_time.split(":").map(Number);
                const [closeHour, closeMinute] = oh.closing_time.split(":").map(Number);

                const openingMinutes = openHour * 60 + openMinute;
                const closingMinutes = closeHour * 60 + closeMinute;

                if (closingMinutes <= openingMinutes) {
                    return `Closing time must be greater than opening time for ${days[oh.day_of_week]}.`;
                }
            }else{
                return `Opening time and Closing time is required if you're gonna open for ${days[oh.day_of_week]}.`;
            }
            
        }
    }

    return null;
}

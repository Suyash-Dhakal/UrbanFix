import { mailtrapClient } from "./mailtrap.config.js";
import { sender } from "./mailtrap.config.js";
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";

export const sendVerificationEmail=async (email, verificationToken)=>{
    const recipient = [{
        email: email
    }];

    try {
        const response =await mailtrapClient.send({
            from:sender,
            to:recipient,
            subject: "Verify Your Email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification",
        })
        console.log("Email sent successfully:", response);
        
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send verification email");
    }
}

export const sendWelcomeEmail=async (name, email)=>{
   const recipient=[{email}];
   try {
    const response= await mailtrapClient.send({
        from: sender,
        to: recipient,
        template_uuid:"0d9ec13a-e3f3-46a2-b2dc-b0928429a79c",
        template_variables:{
            first_name: name,
        }
    });
    console.log("Welcome email sent successfully:", response);
    
   } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send welcome email");
    
   }
}
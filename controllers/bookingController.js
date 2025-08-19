const Booking = require('../models/booking');
const User = require('../models/agent');
const Property = require('../models/property');
const { sendSuccess, sendError } = require('../helpers/responseHelper');
const cron = require('node-cron');
require('dotenv').config();
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const createCustomerConfirmationEmail = (bookingData, propertyData) => {
  const { date, time, name, email } = bookingData
  const property = propertyData

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                <div style="background-color: rgba(255, 255, 255, 0.1); display: inline-block; padding: 12px 24px; border-radius: 50px; margin-bottom: 20px;">
                    <div style="width: 40px; height: 40px; background-color: #ffffff; border-radius: 50%; display: inline-block; position: relative;">
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #667eea; font-size: 20px; font-weight: bold;">🏠</div>
                    </div>
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Booking Confirmed!</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Your property viewing has been successfully scheduled</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                
                <!-- Greeting -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #1a202c; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Hello ${name || "Valued Customer"},</h2>
                    <p style="color: #4a5568; margin: 0; font-size: 16px;">We're excited to confirm your property viewing appointment. Here are the details:</p>
                </div>

                <!-- Booking Details Card -->
                <div style="background-color: #f7fafc; border-left: 4px solid #667eea; padding: 25px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                    <h3 style="color: #2d3748; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                        <span style="background-color: #667eea; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px;">📅</span>
                        Appointment Details
                    </h3>
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #4a5568; font-weight: 500;">Date:</span>
                            <span style="color: #2d3748; font-weight: 600;">${date}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #4a5568; font-weight: 500;">Time:</span>
                            <span style="color: #2d3748; font-weight: 600;">${time}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span style="color: #4a5568; font-weight: 500;">Contact Email:</span>
                            <span style="color: #2d3748; font-weight: 600;">${email}</span>
                        </div>
                    </div>
                </div>

                ${property
      ? `
                <!-- Property Details -->
                <div style="background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
                    <div style="background-color: #2d3748; color: white; padding: 20px; text-align: center;">
                        <h3 style="margin: 0; font-size: 20px; font-weight: 600;">${property.name}</h3>
                        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">${property.type} • ${property.category}</p>
                    </div>
                    
                    <div style="padding: 25px;">
                        <!-- Price Section -->
                        <div style="text-align: center; margin-bottom: 25px; padding: 20px; background-color: #f7fafc; border-radius: 8px;">
                            <div style="font-size: 32px; font-weight: 700; color: #2d3748; margin-bottom: 5px;">${property.price}</div>
                            ${property.rental_price ? `<div style="font-size: 16px; color: #4a5568;">Rental: ${property.rental_price}</div>` : ""}
                        </div>

                        <!-- Property Info Grid -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                            <div style="padding: 15px; background-color: #f7fafc; border-radius: 6px; text-align: center;">
                                <div style="font-size: 18px; font-weight: 600; color: #2d3748;">${property.unit_number || "N/A"}</div>
                                <div style="font-size: 12px; color: #4a5568; text-transform: uppercase; letter-spacing: 0.5px;">Unit Number</div>
                            </div>
                            <div style="padding: 15px; background-color: #f7fafc; border-radius: 6px; text-align: center;">
                                <div style="font-size: 18px; font-weight: 600; color: #2d3748;">${property.area || "N/A"}</div>
                                <div style="font-size: 12px; color: #4a5568; text-transform: uppercase; letter-spacing: 0.5px;">Area</div>
                            </div>
                        </div>

                        <!-- Address -->
                        <div style="margin-bottom: 20px; padding: 15px; background-color: #f7fafc; border-radius: 6px;">
                            <div style="font-size: 14px; color: #4a5568; margin-bottom: 5px;">📍 Address</div>
                            <div style="font-size: 16px; color: #2d3748; font-weight: 500;">${property.address}</div>
                        </div>

                        ${property.features && property.features.length > 0
        ? `
                        <!-- Features -->
                        <div style="margin-bottom: 20px;">
                            <div style="font-size: 16px; color: #2d3748; font-weight: 600; margin-bottom: 10px;">✨ Features</div>
                            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                                ${property.features
          .map(
            (feature) => `
                                    <span style="background-color: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${feature}</span>
                                `,
          )
          .join("")}
                            </div>
                        </div>
                        `
        : ""
      }

                        ${property.description
        ? `
                        <!-- Description -->
                        <div style="margin-bottom: 20px;">
                            <div style="font-size: 16px; color: #2d3748; font-weight: 600; margin-bottom: 10px;">📝 Description</div>
                            <p style="color: #4a5568; line-height: 1.6; margin: 0;">${property.description}</p>
                        </div>
                        `
        : ""
      }

                        <!-- Additional Details -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                            ${property.service_charges
        ? `
                            <div>
                                <span style="color: #4a5568;">Service Charges:</span>
                                <span style="color: #2d3748; font-weight: 600; margin-left: 5px;">${property.service_charges}</span>
                            </div>
                            `
        : ""
      }
                            ${property.parking_space
        ? `
                            <div>
                                <span style="color: #4a5568;">Parking:</span>
                                <span style="color: #2d3748; font-weight: 600; margin-left: 5px;">${property.parking_space}</span>
                            </div>
                            `
        : ""
      }
                        </div>
                    </div>
                </div>
                `
      : ""
    }

                <!-- Next Steps -->
                <div style="background-color: #edf2f7; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                    <h3 style="color: #2d3748; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">What's Next?</h3>
                    <ul style="color: #4a5568; margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;">Our agent will contact you 24 hours before your appointment</li>
                        <li style="margin-bottom: 8px;">Please bring a valid ID for the property viewing</li>
                        <li style="margin-bottom: 8px;">Feel free to prepare any questions about the property</li>
                        <li>If you need to reschedule, please contact us at least 2 hours in advance</li>
                    </ul>
                </div>

                <!-- Contact Info -->
                <div style="text-align: center; padding: 20px; background-color: #f7fafc; border-radius: 8px;">
                    <p style="color: #4a5568; margin: 0 0 10px 0;">Need to make changes or have questions?</p>
                    <p style="color: #2d3748; font-weight: 600; margin: 0;">Contact us at: <a href="mailto:${process.env.SMTP_EMAIL || "info@property.com"}" style="color: #667eea; text-decoration: none;">${process.env.SMTP_EMAIL || "info@property.com"}</a></p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #2d3748; color: white; padding: 30px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Thank you for choosing us!</p>
                <p style="margin: 0; opacity: 0.8; font-size: 14px;">We look forward to helping you find your perfect property.</p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <p style="margin: 0; opacity: 0.6; font-size: 12px;">© ${new Date().getFullYear()} Property Management. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
}

const createAgentNotificationEmail = (bookingData, propertyData) => {
  const { date, time, name, email } = bookingData
  const property = propertyData

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Booking Alert</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center;">
                <div style="background-color: rgba(255, 255, 255, 0.1); display: inline-block; padding: 12px 24px; border-radius: 50px; margin-bottom: 20px;">
                    <div style="width: 40px; height: 40px; background-color: #ffffff; border-radius: 50%; display: inline-block; position: relative;">
                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #f5576c; font-size: 20px; font-weight: bold;">🔔</div>
                    </div>
                </div>
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">New Booking Alert!</h1>
                <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">A customer has scheduled a property viewing</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                
                <!-- Greeting -->
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #1a202c; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Hello Agent,</h2>
                    <p style="color: #4a5568; margin: 0; font-size: 16px;">You have a new property viewing appointment. Please review the details below and prepare accordingly.</p>
                </div>

                <!-- Customer Info Card -->
                <div style="background-color: #f7fafc; border-left: 4px solid #f5576c; padding: 25px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                    <h3 style="color: #2d3748; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center;">
                        <span style="background-color: #f5576c; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px;">👤</span>
                        Customer Information
                    </h3>
                    <div style="display: grid; gap: 12px;">
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #4a5568; font-weight: 500;">Name:</span>
                            <span style="color: #2d3748; font-weight: 600;">${name || "Not provided"}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #4a5568; font-weight: 500;">Email:</span>
                            <span style="color: #2d3748; font-weight: 600;"><a href="mailto:${email}" style="color: #f5576c; text-decoration: none;">${email}</a></span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #4a5568; font-weight: 500;">Appointment Date:</span>
                            <span style="color: #2d3748; font-weight: 600;">${date}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span style="color: #4a5568; font-weight: 500;">Appointment Time:</span>
                            <span style="color: #2d3748; font-weight: 600;">${time}</span>
                        </div>
                    </div>
                </div>

                ${property
      ? `
                <!-- Property Summary -->
                <div style="background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 30px;">
                    <div style="background-color: #2d3748; color: white; padding: 20px; text-align: center;">
                        <h3 style="margin: 0; font-size: 20px; font-weight: 600;">${property.name}</h3>
                        <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">${property.type} • ${property.category}</p>
                    </div>
                    
                    <div style="padding: 25px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px; text-align: center;">
                            <div style="padding: 15px; background-color: #f7fafc; border-radius: 6px;">
                                <div style="font-size: 18px; font-weight: 600; color: #2d3748;">${property.price}</div>
                                <div style="font-size: 12px; color: #4a5568; text-transform: uppercase;">Price</div>
                            </div>
                            <div style="padding: 15px; background-color: #f7fafc; border-radius: 6px;">
                                <div style="font-size: 18px; font-weight: 600; color: #2d3748;">${property.area || "N/A"}</div>
                                <div style="font-size: 12px; color: #4a5568; text-transform: uppercase;">Area</div>
                            </div>
                            <div style="padding: 15px; background-color: #f7fafc; border-radius: 6px;">
                                <div style="font-size: 18px; font-weight: 600; color: #2d3748;">${property.unit_number || "N/A"}</div>
                                <div style="font-size: 12px; color: #4a5568; text-transform: uppercase;">Unit</div>
                            </div>
                        </div>
                        
                        <div style="padding: 15px; background-color: #f7fafc; border-radius: 6px;">
                            <div style="font-size: 14px; color: #4a5568; margin-bottom: 5px;">📍 Address</div>
                            <div style="font-size: 16px; color: #2d3748; font-weight: 500;">${property.address}</div>
                        </div>
                    </div>
                </div>
                `
      : ""
    }

                <!-- Action Items -->
                <div style="background-color: #fff5f5; border: 1px solid #fed7d7; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
                    <h3 style="color: #c53030; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">⚡ Action Required</h3>
                    <ul style="color: #4a5568; margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 8px;">Contact the customer 24 hours before the appointment</li>
                        <li style="margin-bottom: 8px;">Prepare property keys and access cards</li>
                        <li style="margin-bottom: 8px;">Review property details and recent updates</li>
                        <li style="margin-bottom: 8px;">Prepare marketing materials and floor plans</li>
                        <li>Update your calendar and set reminders</li>
                    </ul>
                </div>

                <!-- Quick Actions -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="mailto:${email}?subject=Property Viewing Confirmation - ${date}" style="display: inline-block; background-color: #f5576c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 10px 10px 0;">Contact Customer</a>
                    <a href="tel:${email}" style="display: inline-block; background-color: #4a5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 10px 10px 0;">Call Customer</a>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #2d3748; color: white; padding: 30px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Property Management System</p>
                <p style="margin: 0; opacity: 0.8; font-size: 14px;">Stay organized, stay successful!</p>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <p style="margin: 0; opacity: 0.6; font-size: 12px;">© ${new Date().getFullYear()} Property Management. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `
}
// Configure mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Or configure SMTP
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});
// Updated booking creation function with new email templates
exports.createBooking = async (req, res) => {
  try {
    const { date, time, property_id, email, name, agent_id } = req.body

    // Check if booking already exists
    const existingBooking = await Booking.findOne({ date, time, property_id })
    if (existingBooking) {
      return sendError(res, "Booking already exists for the selected date and time slot.", 400)
    }

    // Save the booking
    const booking = new Booking(req.body)
    await booking.save()

    // Populate property details
    const property = await Property.findById(property_id)
    const agentEmail = req.body.email



    return sendSuccess(res, "Booking created successfully", { booking }, 200);

  } catch (err) {
    console.error("Error in createBooking:", err)
    return sendError(res, "Something went wrong while creating the booking", 500, err.message)
  }
}

exports.signupAndCreateBooking = async (req, res) => {
  const { name, email, password, phone, image, address, date, time, property_id, rera_doc, rera_id, notes } = req.body;

  try {
    // Step 1: Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // If user doesn't exist → signup
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        name,
        email,
        password: hashedPassword,
        image,
        address,
        phone,
        rera_doc,
        rera_id,
        status: "pending"
      });
      await user.save();
    }

    // Step 2: Check if booking already exists for property, date, and time
    const existingBooking = await Booking.findOne({ date, time, property_id });
    if (existingBooking) {
      return sendError(res, "Booking already exists for the selected date and time slot.", 400);
    }

    // Step 3: Create new booking
    const booking = new Booking({
      date,
      time,
      property_id,
      email: user.email,
      name: user.name,
      agent_id: user._id,
      notes
    });
    await booking.save();

    // Step 4: Populate property details
    const property = await Property.findById(property_id);

    // // Step 5: Setup email transporter
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.SMTP_EMAIL,
    //     pass: process.env.SMTP_PASS,
    //   },
    //   port: 465,
    // });

    // // Step 6: Prepare booking data
    // const bookingData = { date, time, name: user.name, email: user.email };

    // // Step 7: Send email to customer
    // const customerMailOptions = {
    //   from: process.env.SMTP_EMAIL,
    //   to: user.email,
    //   subject: `🏠 Booking Confirmed - ${date} at ${time}`,
    //   html: createCustomerConfirmationEmail(bookingData, property),
    // };

    // // Step 8: Send email to agent
    // const agentMailOptions = {
    //   from: process.env.SMTP_EMAIL,
    //   to: user.email, // agent gets notified
    //   subject: `🔔 New Property Viewing - ${date} at ${time}`,
    //   html: createAgentNotificationEmail(bookingData, property),
    // };

    // await Promise.all([
    //   transporter.sendMail(customerMailOptions),
    //   transporter.sendMail(agentMailOptions),
    // ]);

    // Step 9: Generate token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    const responseData = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
        image: user?.image,
        token,
      },
      booking,
    };

    return sendSuccess(res, "Signup and booking created successfully", responseData, 200);
  } catch (err) {
    console.error("Error in signupAndCreateBooking:", err);
    return sendError(res, "Something went wrong while processing signup & booking", 500, err.message);
  }
};





exports.getBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";
    const status = req.query.status?.trim().toLowerCase();
    const agent_id = req.query.agent_id?.trim();

    const skip = (page - 1) * limit;

    const match = {};

    // Search match
    if (search !== "") {
      match.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { purpose: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Filter match
    if (status) match.status = status;
    if (agent_id) match.agent_id = agent_id;

    // Count total records
    const total = await Booking.countDocuments(match);

    // Get available statuses (for filtering frontend)
    const distinctStatuses = await Booking.distinct("status");

    // Fetch paginated bookings sorted by latest first
    const bookings = await Booking.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "properties",
          let: { propertyId: "$property_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$propertyId" }],
                },
              },
            },
          ],
          as: "property",
        },
      },
      { $unwind: { path: "$property", preserveNullAndEmptyArrays: true } },

      // Sort by creation date (latest first)
      { $sort: { createdAt: -1 } },

      { $skip: skip },
      { $limit: limit },
    ]);

    return sendSuccess(res, "Bookings fetched successfully", {
      bookings,
      count: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limitPerPage: limit,
      debug: {
        queryUsed: match,
        receivedStatus: status,
        receivedAgentId: agent_id,
        availableStatuses: distinctStatuses,
      },
    });
  } catch (err) {
    console.error("Error in getBookings:", err);
    return sendError(res, "Failed to fetch bookings", 500, err.message);
  }
};








exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return sendError(res, 'Booking not found', 404);
    return sendSuccess(res, 'Booking fetched successfully', { booking });
  } catch (err) {
    return sendError(res, 'Failed to fetch booking', 500, err.message);
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    if (!id) return sendError(res, "Booking ID is required in body", 400);

    // First update
    await Booking.findByIdAndUpdate(id, updateData, { new: true });

    // Then fetch with populate
const booking = await Booking.findById(id).populate({
  path: "property_id",
  model: "Property",
});


    if (!booking) return sendError(res, "Booking not found", 404);

    console.log("Updated booking with property:", booking);

    // Send confirmation email if approved
    if (updateData.status && updateData.status === "approved") {
      try {
        const html = createCustomerConfirmationEmail(
          booking,
          booking.property_id // property details now available
        );

        await transporter.sendMail({
          from: `"RRProperties" <${process.env.MAIL_USER}>`,
          to: booking.email,
          subject: "Your Booking is Confirmed ✅",
          html,
        });

        console.log("Confirmation email sent to", booking.email);
      } catch (mailError) {
        console.error("Error sending email:", mailError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Update booking error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updateFeedback = async (req, res) => {
  try {
    const { id, feedback } = req.body;

    if (!id) return sendError(res, "Booking ID is required", 400);
    if (!feedback || typeof feedback !== 'object')
      return sendError(res, "Feedback object is required", 400);

    // Update the feedback field
    const booking = await Booking.findByIdAndUpdate(
      id,
      { feedback },
      { new: true }
    );

    if (!booking) return sendError(res, "Booking not found", 404);

    return sendSuccess(res, "Feedback updated successfully", { booking });
  } catch (err) {
    console.error("Error in updateFeedback:", err);
    return sendError(res, "Failed to update feedback", 500, err.message);
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return sendError(res, 'Booking not found', 404);

    return sendSuccess(res, 'Booking deleted successfully');
  } catch (err) {
    return sendError(res, 'Failed to delete booking', 500, err.message);
  }
};




cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    const result = await Booking.deleteMany({
      date: { $lt: now },
      status: 'pending' // ✅ Only delete bookings with pending status
    });
    console.log(`[CRON] Deleted ${result.deletedCount} expired pending bookings`);
  } catch (error) {
    console.error('[CRON] Error deleting expired bookings:', error.message);
  }
});

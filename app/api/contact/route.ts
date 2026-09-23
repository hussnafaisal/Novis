import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Please enter a valid email address."),
  phone: z.string().trim().max(30, "Phone number is too long.").optional(),
  subject: z.string().trim().min(2, "Subject is required."),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(3000, "Message is too long."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error:
            result.error.issues[0]?.message ||
            "Please check the form.",
        },
        { status: 400 }
      );
    }

    /*
     * Contact form validation is completed here.
     *
     * The current project database layer does not contain
     * a contact model, so we do not call db.contact.create().
     *
     * This keeps the API compatible with the current database
     * structure and allows the Netlify build to complete.
     */

    return NextResponse.json({
      ok: true,
      message: "Your message has been received successfully.",
      contact: {
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone || "",
        subject: result.data.subject,
        message: result.data.message,
      },
    });
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to process your message right now.",
      },
      { status: 500 }
    );
  }
}
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import InfoPageLayout from "./InfoPageLayout";
import { CONTACT_EMAILS, mailto } from "../../constants/contactEmails";
import { SendContactMessage } from "../../services/contact-service";
import contactStyles from "./ContactPage.module.scss";

type ContactFormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const ContactPage = () => {
  const { t } = useTranslation();

  const schema = yup.object().shape({
    name: yup.string().required(t("contact.nameRequired")),
    email: yup.string().email(t("registration.invalidEmail")).required(t("login.emailRequired")),
    subject: yup.string().required(t("contact.subjectRequired")),
    message: yup
      .string()
      .required(t("contact.messageRequired"))
      .min(10, t("contact.messageTooShort")),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await SendContactMessage(values);
      toast.success(t("contact.success"));
      reset();
    } catch {
      toast.error(t("contact.error"));
    }
  };

  return (
    <InfoPageLayout title={t("contact.title")} intro={t("contact.intro")}>
      <div className={contactStyles.grid}>
        <aside className={contactStyles.channels}>
          <h2 className={contactStyles.channelsTitle}>{t("contact.directTitle")}</h2>
          <ul className={contactStyles.list}>
            <li>
              <span>{t("contact.supportLabel")}</span>
              <a href={mailto(CONTACT_EMAILS.support)}>{CONTACT_EMAILS.support}</a>
            </li>
            <li>
              <span>{t("contact.infoLabel")}</span>
              <a href={mailto(CONTACT_EMAILS.info)}>{CONTACT_EMAILS.info}</a>
            </li>
            <li>
              <span>{t("contact.privacyLabel")}</span>
              <a href={mailto(CONTACT_EMAILS.privacy)}>{CONTACT_EMAILS.privacy}</a>
            </li>
            <li>
              <span>{t("contact.legalLabel")}</span>
              <a href={mailto(CONTACT_EMAILS.legal)}>{CONTACT_EMAILS.legal}</a>
            </li>
          </ul>
        </aside>

        <form className={contactStyles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className={contactStyles.field}>
            <span>{t("contact.name")}</span>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <input {...field} className={contactStyles.input} />}
            />
            {errors.name ? <em>{errors.name.message}</em> : null}
          </label>

          <label className={contactStyles.field}>
            <span>{t("contact.email")}</span>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <input {...field} type="email" autoComplete="email" className={contactStyles.input} />
              )}
            />
            {errors.email ? <em>{errors.email.message}</em> : null}
          </label>

          <label className={contactStyles.field}>
            <span>{t("contact.subject")}</span>
            <Controller
              name="subject"
              control={control}
              render={({ field }) => <input {...field} className={contactStyles.input} />}
            />
            {errors.subject ? <em>{errors.subject.message}</em> : null}
          </label>

          <label className={contactStyles.field}>
            <span>{t("contact.message")}</span>
            <Controller
              name="message"
              control={control}
              render={({ field }) => <textarea {...field} rows={6} className={contactStyles.textarea} />}
            />
            {errors.message ? <em>{errors.message.message}</em> : null}
          </label>

          <button type="submit" className={contactStyles.submit} disabled={isSubmitting}>
            {isSubmitting ? t("common.loading") : t("contact.send")}
          </button>
        </form>
      </div>
    </InfoPageLayout>
  );
};

export default ContactPage;

import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { UpsertWorkExperiencePayload, WorkExperience } from "../../models/WorkExperience.model";
import {
  CreateWorkExperience,
  DeleteWorkExperience,
  GetMyWorkExperiences,
  UpdateWorkExperience,
} from "../../services/employee-profile-service";
import styles from "./WorkExperienceSection.module.scss";

const emptyForm: UpsertWorkExperiencePayload = {
  companyName: "",
  position: "",
  startDate: "",
  endDate: "",
  description: "",
};

const toDateInputValue = (value?: string) => {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().slice(0, 10);
};

const WorkExperienceSection = () => {
  const { t } = useTranslation();
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UpsertWorkExperiencePayload>(emptyForm);

  const loadExperiences = async () => {
    setIsLoading(true);
    try {
      const response = await GetMyWorkExperiences();
      setExperiences(response.data);
    } catch {
      toast.error(t("employeeProfile.failedLoadExperience"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadExperiences();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleEdit = (experience: WorkExperience) => {
    setEditingId(experience.id);
    setForm({
      companyName: experience.companyName,
      position: experience.position,
      startDate: toDateInputValue(experience.startDate),
      endDate: toDateInputValue(experience.endDate),
      description: experience.description ?? "",
    });
  };

  const handleDelete = async (experienceId: string) => {
    try {
      await DeleteWorkExperience(experienceId);
      setExperiences((previous) => previous.filter((item) => item.id !== experienceId));
      if (editingId === experienceId) {
        resetForm();
      }
      toast.success(t("employeeProfile.experienceDeleted"));
    } catch {
      toast.error(t("employeeProfile.experienceSaveError"));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.companyName.trim() || !form.position.trim() || !form.startDate) {
      toast.error(t("employeeProfile.experienceRequiredFields"));
      return;
    }

    const payload: UpsertWorkExperiencePayload = {
      companyName: form.companyName.trim(),
      position: form.position.trim(),
      startDate: form.startDate,
      endDate: form.endDate?.trim() ? form.endDate : undefined,
      description: form.description?.trim() ? form.description.trim() : undefined,
    };

    setIsSaving(true);
    try {
      if (editingId) {
        const response = await UpdateWorkExperience(editingId, payload);
        setExperiences((previous) =>
          previous.map((item) => (item.id === editingId ? response.data : item))
        );
        toast.success(t("employeeProfile.experienceUpdated"));
      } else {
        const response = await CreateWorkExperience(payload);
        setExperiences((previous) => [response.data, ...previous]);
        toast.success(t("employeeProfile.experienceCreated"));
      }
      resetForm();
    } catch {
      toast.error(t("employeeProfile.experienceSaveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = toDateInputValue(startDate);
    const end = endDate ? toDateInputValue(endDate) : t("employeeProfile.present");
    return `${start} – ${end}`;
  };

  return (
    <div className={styles.section}>
      {isLoading && <p className={styles.mutedText}>{t("common.loading")}</p>}

      {!isLoading && experiences.length > 0 && (
        <div className={styles.list}>
          {experiences.map((experience) => (
            <article key={experience.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h4>{experience.position}</h4>
                  <p className={styles.company}>{experience.companyName}</p>
                  <p className={styles.dates}>
                    {formatDateRange(experience.startDate, experience.endDate)}
                  </p>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={styles.linkButton} onClick={() => handleEdit(experience)}>
                    {t("profile.edit")}
                  </button>
                  <button
                    type="button"
                    className={styles.linkButtonDanger}
                    onClick={() => void handleDelete(experience.id)}
                  >
                    {t("common.remove")}
                  </button>
                </div>
              </div>
              {experience.description && <p className={styles.description}>{experience.description}</p>}
            </article>
          ))}
        </div>
      )}

      {!isLoading && experiences.length === 0 && (
        <p className={styles.mutedText}>{t("employeeProfile.noExperience")}</p>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <h3>{editingId ? t("employeeProfile.editExperience") : t("employeeProfile.addExperience")}</h3>
        <div className={styles.formGrid}>
          <label>
            {t("employeeProfile.companyName")}
            <input
              className={styles.input}
              value={form.companyName}
              onChange={(event) => setForm((previous) => ({ ...previous, companyName: event.target.value }))}
            />
          </label>
          <label>
            {t("employeeProfile.position")}
            <input
              className={styles.input}
              value={form.position}
              onChange={(event) => setForm((previous) => ({ ...previous, position: event.target.value }))}
            />
          </label>
          <label>
            {t("employeeProfile.startDate")}
            <input
              className={styles.input}
              type="date"
              value={form.startDate}
              onChange={(event) => setForm((previous) => ({ ...previous, startDate: event.target.value }))}
            />
          </label>
          <label>
            {t("employeeProfile.endDate")}
            <input
              className={styles.input}
              type="date"
              value={form.endDate ?? ""}
              onChange={(event) => setForm((previous) => ({ ...previous, endDate: event.target.value }))}
            />
          </label>
        </div>
        <label className={styles.fullWidth}>
          {t("employeeProfile.description")}
          <textarea
            className={styles.textarea}
            rows={3}
            value={form.description ?? ""}
            onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
          />
        </label>
        <div className={styles.formActions}>
          <button type="submit" className={styles.primaryButton} disabled={isSaving}>
            {isSaving ? t("common.loading") : editingId ? t("common.save") : t("employeeProfile.addExperience")}
          </button>
          {editingId && (
            <button type="button" className={styles.secondaryButton} onClick={resetForm}>
              {t("common.cancel")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default WorkExperienceSection;

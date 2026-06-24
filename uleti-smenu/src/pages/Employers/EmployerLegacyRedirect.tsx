import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ResolveEmployerSlug } from "../../services/employer-profile-service";

type EmployerLegacyRedirectProps = {
  target: "profile" | "reviews";
};

const EmployerLegacyRedirect = ({ target }: EmployerLegacyRedirectProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { employerId } = useParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    const redirect = async () => {
      if (!employerId) {
        setError(true);
        return;
      }

      try {
        const response = await ResolveEmployerSlug(employerId);
        const slug = response.data.slug?.trim();
        if (!slug) {
          setError(true);
          return;
        }

        navigate(
          target === "reviews" ? `/restaurants/${slug}/reviews` : `/restaurants/${slug}`,
          { replace: true }
        );
      } catch {
        setError(true);
      }
    };

    void redirect();
  }, [employerId, navigate, target]);

  if (error) {
    return <div>{t("employerProfile.loadError")}</div>;
  }

  return <div>{t("common.loading")}</div>;
};

export default EmployerLegacyRedirect;

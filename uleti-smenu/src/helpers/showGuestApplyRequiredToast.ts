import { toast } from "react-toastify";
import i18n from "../i18n";

export const showGuestApplyRequiredToast = () => {
  toast.info(i18n.t("publicBrowse.applyAuthRequired"), {
    autoClose: 5000,
  });
};

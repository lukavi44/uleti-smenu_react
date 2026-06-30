import { TFunction } from "i18next";
import {
  ArrowRightOnRectangleIcon,
  BuildingOffice2Icon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  HomeIcon,
  NewspaperIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  ArrowRightOnRectangleIcon as ArrowRightOnRectangleIconSolid,
  BuildingOffice2Icon as BuildingOffice2IconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  ClipboardDocumentListIcon as ClipboardDocumentListIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  HomeIcon as HomeIconSolid,
  NewspaperIcon as NewspaperIconSolid,
  UserGroupIcon as UserGroupIconSolid,
} from "@heroicons/react/24/solid";
import { ComponentType, SVGProps } from "react";

export type AdminNavItem = {
  to: string;
  labelKey: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  ActiveIcon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
};

export const getAdminNavItems = (t: TFunction): AdminNavItem[] => [
  { to: "/admin", labelKey: t("admin.nav.dashboard"), Icon: HomeIcon, ActiveIcon: HomeIconSolid, end: true },
  { to: "/admin/candidates", labelKey: t("admin.nav.candidates"), Icon: UserGroupIcon, ActiveIcon: UserGroupIconSolid },
  { to: "/admin/employers", labelKey: t("admin.nav.employers"), Icon: BuildingOffice2Icon, ActiveIcon: BuildingOffice2IconSolid },
  {
    to: "/admin/restaurants",
    labelKey: t("admin.nav.restaurants"),
    Icon: BuildingStorefrontIcon,
    ActiveIcon: BuildingStorefrontIconSolid,
  },
  { to: "/admin/job-posts", labelKey: t("admin.nav.jobPosts"), Icon: NewspaperIcon, ActiveIcon: NewspaperIconSolid },
  {
    to: "/admin/applications",
    labelKey: t("admin.nav.applications"),
    Icon: ClipboardDocumentListIcon,
    ActiveIcon: ClipboardDocumentListIconSolid,
  },
  { to: "/admin/billing", labelKey: t("admin.nav.billing"), Icon: CreditCardIcon, ActiveIcon: CreditCardIconSolid },
  { to: "/admin/reports", labelKey: t("admin.nav.reports"), Icon: ChartBarIcon, ActiveIcon: ChartBarIconSolid },
  { to: "/admin/settings", labelKey: t("admin.nav.settings"), Icon: Cog6ToothIcon, ActiveIcon: Cog6ToothIconSolid },
];

export const getAdminMobileNavItems = (t: TFunction): AdminNavItem[] => [
  { to: "/admin", labelKey: t("admin.nav.dashboard"), Icon: HomeIcon, ActiveIcon: HomeIconSolid, end: true },
  { to: "/admin/candidates", labelKey: t("admin.nav.candidates"), Icon: UserGroupIcon, ActiveIcon: UserGroupIconSolid },
  { to: "/admin/employers", labelKey: t("admin.nav.employers"), Icon: BuildingOffice2Icon, ActiveIcon: BuildingOffice2IconSolid },
  { to: "/admin/job-posts", labelKey: t("admin.nav.jobsShort"), Icon: NewspaperIcon, ActiveIcon: NewspaperIconSolid },
];

export const adminLogoutItem = {
  labelKey: "header.logout",
  Icon: ArrowRightOnRectangleIcon,
  ActiveIcon: ArrowRightOnRectangleIconSolid,
};

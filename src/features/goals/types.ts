import type { activityStatusEnum, goalStatusEnum } from "@/db/schema/enums";

export type GoalStatus = (typeof goalStatusEnum.enumValues)[number];
export type ActivityStatus = (typeof activityStatusEnum.enumValues)[number];

export type GoalActivityListItem = {
  id: string;
  title: string;
  status: ActivityStatus;
};

export type GoalListItem = {
  id: string;
  title: string;
  status: GoalStatus;
  createdAtLabel: string;
  startDate: string;
  endDate: string | null;
  activities: GoalActivityListItem[];
};

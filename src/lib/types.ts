export type SurveyPayload = {
  province: string;
  city?: string;
  user_type: "app" | "agent";
  tools: string[];
  frequency?: string;
  occupation?: string;
};

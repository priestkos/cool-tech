import type { RegisterOptions } from "react-hook-form"

export type SettingsFormValues = {
  displayName: string
  bio: string
  emailAlerts: boolean
  productTips: boolean
  volume: number
}

export const settingsFormDefaults: SettingsFormValues = {
  displayName: "",
  bio: "",
  emailAlerts: true,
  productTips: false,
  volume: 42,
}

export const settingsFieldRules: {
  [K in keyof SettingsFormValues]: RegisterOptions<SettingsFormValues, K>
} = {
  displayName: {
    required: "Display name is required for your fictional profile.",
    minLength: { value: 2, message: "Use at least 2 characters." },
  },
  bio: {
    maxLength: { value: 160, message: "Bio must stay under 160 characters." },
  },
  emailAlerts: {},
  productTips: {},
  volume: {
    min: { value: 0, message: "Volume cannot go below 0." },
    max: { value: 100, message: "Volume cannot exceed 100." },
  },
}

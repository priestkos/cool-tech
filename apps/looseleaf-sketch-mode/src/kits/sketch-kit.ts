import { toast } from "sonner"

import { Badge } from "@/looseleaf/components/ui/badge"
import { Button } from "@/looseleaf/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/looseleaf/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/looseleaf/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/looseleaf/components/ui/form"
import { Input } from "@/looseleaf/components/ui/input"
import { Label } from "@/looseleaf/components/ui/label"
import { Slider } from "@/looseleaf/components/ui/slider"
import { Toaster } from "@/looseleaf/components/ui/sonner"
import { Switch } from "@/looseleaf/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/looseleaf/components/ui/tabs"
import { Textarea } from "@/looseleaf/components/ui/textarea"
import type { UiKit } from "@/kits/plain-kit"

export const sketchKit = {
  Button,
  Badge,
  Card: Object.assign(Card, {
    Header: CardHeader,
    Title: CardTitle,
    Description: CardDescription,
    Content: CardContent,
    Footer: CardFooter,
  }),
  Tabs: Object.assign(Tabs, {
    List: TabsList,
    Trigger: TabsTrigger,
    Content: TabsContent,
  }),
  Switch,
  Slider,
  Input,
  Textarea,
  Label,
  Dialog: Object.assign(Dialog, {
    Trigger: DialogTrigger,
    Content: DialogContent,
    Header: DialogHeader,
    Title: DialogTitle,
    Description: DialogDescription,
    Footer: DialogFooter,
    Close: DialogClose,
  }),
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Toaster,
  toast: (message: string) => {
    toast.success(message)
  },
} as UiKit

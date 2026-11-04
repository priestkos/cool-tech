import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Toaster } from "@/components/ui/sonner"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export const plainKit = {
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
}

export type UiKit = typeof plainKit

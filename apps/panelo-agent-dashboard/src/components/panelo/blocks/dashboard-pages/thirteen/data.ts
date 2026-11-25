import { Bell, CalendarDays, ClipboardList, House, LayoutGrid, ChartColumn, ShieldCheck, UsersRound, type LucideIcon } from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*  Demo data for dashboard-pages/thirteen: a home-care agency's dispatch      */
/*  board on one Monday. Times are minutes from midnight. Everything the page  */
/*  shows (counts, hours, travel gaps, coverage) is derived from these rows.   */
/* -------------------------------------------------------------------------- */

export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const org = { name: 'Visitly', agency: 'Thistledown Home Care' }
export const user = { name: 'Nizam', role: 'Care coordinator', avatar: '/avatars/jaydon-aminoff.webp' }

/** The board's day, and the minute it treats as "now". */
export const TODAY = { weekday: 'Monday', short: 'Mon', month: 'Oct', date: 5 }
export const NOW = 13 * 60 + 38
/** The timeline runs 7 AM → 7 PM. */
export const DAY_START = 7 * 60
export const DAY_END = 19 * 60

export type NavItem = { label: string; icon: LucideIcon; active?: boolean; badge?: number }
export const nav: { label: string; items: NavItem[] }[] = [
    {
        label: 'Operations',
        items: [
            { label: 'Dashboard', icon: LayoutGrid },
            { label: 'Schedule', icon: CalendarDays, active: true },
            { label: 'Visits', icon: ClipboardList },
            { label: 'Alerts', icon: Bell, badge: 4 },
        ],
    },
    {
        label: 'People',
        items: [
            { label: 'Caregivers', icon: UsersRound },
            { label: 'Clients', icon: House },
        ],
    },
    {
        label: 'Compliance',
        items: [
            { label: 'EVV', icon: ShieldCheck },
            { label: 'Reports', icon: ChartColumn },
        ],
    },
]

export const AREAS = ['Wauwatosa', 'Bay View', 'Shorewood', 'West Allis'] as const
export type Area = (typeof AREAS)[number]

export type Status = 'confirmed' | 'in-progress' | 'completed' | 'missed' | 'at-risk'

export const STATUS: Record<Status, { label: string }> = {
    confirmed: { label: 'Confirmed' },
    'in-progress': { label: 'In progress' },
    completed: { label: 'Completed' },
    missed: { label: 'Missed' },
    'at-risk': { label: 'At risk' },
}

export type Caregiver = { id: string; name: string; role: 'CNA' | 'HHA' | 'PCA' | 'RN'; avatar?: string; area: Area; calledOut?: string }

export type Visit = {
    id: string
    caregiver: string
    client: string
    /** The full name the visit card shows. */
    clientFull: string
    service: string
    area: Area
    start: number
    end: number
    status: Status
    /** Drive time from the previous visit, in minutes; drawn as a dotted link. */
    drive?: number
    /** Whose route the visit was moved from today; on any other day it is theirs. */
    from?: string
    evv?: string
    note?: string
}

const t = (h: number, m = 0) => h * 60 + m

export const caregivers: Caregiver[] = [
    { id: 'marisol', name: 'Marisol Quintanar', role: 'CNA', avatar: '/avatars/maria-lubin.webp', area: 'Wauwatosa' },
    { id: 'abena', name: 'Abena Ofori', role: 'HHA', avatar: '/avatars/kianna-vaccaro.webp', area: 'Bay View' },
    { id: 'davi', name: 'Davi Monteiro', role: 'CNA', avatar: '/avatars/john-clarkson.webp', area: 'West Allis' },
    { id: 'noemi', name: 'Noemi Castellano', role: 'CNA', avatar: '/avatars/livia-saris.webp', area: 'Shorewood' },
    { id: 'hiwot', name: 'Hiwot Bekele', role: 'HHA', avatar: '/avatars/ann-press.webp', area: 'Wauwatosa' },
    { id: 'tessa', name: 'Tessa Lindqvist', role: 'PCA', area: 'Shorewood' },
    { id: 'hana', name: 'Hana Morikawa', role: 'RN', avatar: '/avatars/aspen-lubin.webp', area: 'Bay View' },
    { id: 'emil', name: 'Emil Haddad', role: 'HHA', avatar: '/avatars/michael-ekstrom.webp', area: 'West Allis' },
    { id: 'bronagh', name: 'Bronagh Kelleher', role: 'CNA', area: 'Wauwatosa' },
    { id: 'gunnar', name: 'Gunnar Halvorsen', role: 'PCA', area: 'Bay View' },
    { id: 'priya', name: 'Priya Raman', role: 'CNA', area: 'Shorewood' },
    { id: 'tomas', name: 'Tomás Ferreira', role: 'HHA', area: 'West Allis' },
    { id: 'yusuf', name: 'Yusuf Adeyemi', role: 'PCA', area: 'Bay View' },
    { id: 'desmond', name: 'Desmond Okonjo', role: 'HHA', area: 'West Allis', calledOut: 'Unavailable today · sick, reported 8:31 AM from the app · his 3 visits were reassigned at 8:52 AM' },
]

/** Rows the board shows before "Show all": the busiest shifts, and anyone who called out. */
export const PINNED = 11

type Row = [client: string, full: string, service: string, area: Area, start: number, end: number, status: Status, extra?: Partial<Visit>]

const shifts: Record<string, Row[]> = {
    marisol: [
        ['Thelma R.', 'Thelma Rasmussen', 'Personal care', 'Wauwatosa', t(7, 30), t(9), 'completed'],
        ['Marguerite H.', 'Marguerite Holloway', 'Personal care', 'Wauwatosa', t(10), t(12), 'completed', { drive: 8, evv: 'Verified · 38 ft from the door', note: 'Follow-up to review' }],
        ['Bernard', 'Bernard Achterberg', 'Companionship', 'Wauwatosa', t(12, 30), t(13, 30), 'completed', { from: 'desmond', note: "Reassigned from Desmond's route" }],
        ['Lucinda F.', 'Lucinda Fairweather', 'Medication reminder', 'Wauwatosa', t(14, 30), t(16), 'confirmed', { drive: 18 }],
        ['Amos P.', 'Amos Pettersen', 'Personal care', 'Wauwatosa', t(16, 30), t(18), 'confirmed', { drive: 15 }],
    ],
    abena: [
        ['Ignatius R.', 'Ignatius Rourke', 'Respite care', 'Bay View', t(7), t(8, 30), 'completed'],
        ['Agnes P.', 'Agnes Pruitt', 'Personal care', 'Bay View', t(15, 30), t(17), 'confirmed'],
        ['Rosalind M.', 'Rosalind Mbeki', 'Meal prep', 'Bay View', t(17, 30), t(19), 'confirmed', { drive: 12 }],
    ],
    davi: [
        ['Clarence U.', 'Clarence Ulrich', 'Personal care', 'West Allis', t(7), t(8, 30), 'completed'],
        ['Cornelius V.', 'Cornelius Vance', 'Mobility support', 'West Allis', t(9), t(10, 30), 'completed', { drive: 24 }],
        ['Winifred A.', 'Winifred Abara', 'Companionship', 'West Allis', t(11), t(12, 30), 'completed'],
        ['Ottilie B.', 'Ottilie Brandt', 'Personal care', 'West Allis', t(13, 30), t(15), 'at-risk', { evv: 'Not clocked in · 8 min late', note: 'Davi is running late from Winifred' }],
        ['Dolores Y.', 'Dolores Yilmaz', 'Medication reminder', 'West Allis', t(16), t(17, 30), 'confirmed'],
    ],
    noemi: [
        ['Edmund T.', 'Edmund Tremblay', 'Personal care', 'Shorewood', t(8), t(9, 30), 'completed'],
        ['Ruth K.', 'Ruth Kowalczyk', 'Bathing', 'Shorewood', t(10), t(11, 30), 'completed', { drive: 14 }],
        ['Iris B.', 'Iris Bellamy', 'Companionship', 'Shorewood', t(11, 45), t(13, 15), 'completed', { drive: 7 }],
        ['Harriet O.', 'Harriet Osei', 'Personal care', 'Shorewood', t(14, 30), t(16), 'confirmed'],
    ],
    hiwot: [
        ['Irving', 'Irving Castellanos', 'Medication reminder', 'Wauwatosa', t(7), t(8), 'completed'],
        ['Josephine V.', 'Josephine Varga', 'Personal care', 'Wauwatosa', t(8, 30), t(10), 'completed', { drive: 13 }],
        ['Leopold M.', 'Leopold Marchetti', 'Mobility support', 'Wauwatosa', t(13), t(14, 30), 'in-progress', { evv: 'Clocked in 12:58 PM · at the door' }],
        ['Solomon G.', 'Solomon Greaves', 'Personal care', 'Wauwatosa', t(16), t(17, 30), 'confirmed'],
    ],
    tessa: [
        ['Mabel T.', 'Mabel Thornbury', 'Companionship', 'Shorewood', t(9), t(10, 30), 'completed'],
        ['Percival D.', 'Percival Dunmore', 'Meal prep', 'Shorewood', t(15, 30), t(17), 'confirmed'],
        ['Rhoda C.', 'Rhoda Carmichael', 'Personal care', 'Shorewood', t(17, 15), t(18, 45), 'confirmed', { drive: 9 }],
    ],
    hana: [
        ['Silas', 'Silas Okafor', 'Wound care', 'Bay View', t(9, 30), t(10, 30), 'completed'],
        ['Ursula', 'Ursula Lindgren', 'Medication review', 'Bay View', t(11), t(12), 'completed', { drive: 17 }],
        ['Kermit', 'Kermit Abernathy', 'Wound care', 'Bay View', t(13), t(14), 'in-progress', { evv: 'Clocked in 12:56 PM · at the door' }],
        ['Nora', 'Nora Fitzgerald', 'Vitals check', 'Bay View', t(14, 30), t(15, 30), 'confirmed', { drive: 12 }],
        ['Opal', 'Opal Whitaker', 'Medication review', 'Bay View', t(16), t(17), 'confirmed', { drive: 10 }],
    ],
    emil: [
        ['Beatrix L.', 'Beatrix Lindholm', 'Personal care', 'West Allis', t(7), t(8, 30), 'completed'],
        ['Vernon C.', 'Vernon Castellano', 'Personal care', 'West Allis', t(9, 30), t(11), 'completed'],
        ['Etta', 'Etta Kowalski', 'Companionship', 'West Allis', t(11, 30), t(12, 30), 'completed', { drive: 15 }],
        ['Walter D.', 'Walter Dunleavy', 'Respite care', 'West Allis', t(13), t(15), 'in-progress', { drive: 11, from: 'desmond', evv: 'Clocked in 12:58 PM · at the door', note: "Reassigned from Desmond's route" }],
        ['Hollis N.', 'Hollis Navarro', 'Personal care', 'West Allis', t(15, 30), t(17), 'confirmed'],
    ],
    bronagh: [
        ['Dorothea L.', 'Dorothea Lister', 'Personal care', 'Wauwatosa', t(7), t(8, 30), 'completed'],
        ['Reuben A.', 'Reuben Ashby', 'Bathing', 'Wauwatosa', t(9), t(11), 'completed', { drive: 19 }],
        ['Maud P.', 'Maud Pemberton', 'Personal care', 'Wauwatosa', t(11, 30), t(13), 'missed', { drive: 12, evv: 'No clock-in recorded', note: 'Client not home · family called back' }],
        ['Cyrus H.', 'Cyrus Halloran', 'Mobility support', 'Wauwatosa', t(13, 30), t(15, 30), 'in-progress', { drive: 16, from: 'desmond', evv: 'Clocked in 1:27 PM · at the door', note: "Reassigned from Desmond's route" }],
        ['Eunice T.', 'Eunice Talbot', 'Personal care', 'Wauwatosa', t(16), t(17, 30), 'confirmed', { drive: 6 }],
    ],
    gunnar: [
        ['Wilhelmina T.', 'Wilhelmina Thorne', 'Companionship', 'Bay View', t(7), t(8, 30), 'completed'],
        ['Philippa S.', 'Philippa Sorensen', 'Personal care', 'Bay View', t(14, 40), t(16, 10), 'confirmed'],
        ['Augustin', 'Augustin Delacroix', 'Meal prep', 'Bay View', t(18), t(19), 'confirmed'],
    ],
    priya: [
        ['Constance W.', 'Constance Whitfield', 'Personal care', 'Shorewood', t(16), t(17), 'confirmed'],
        ['Florian G.', 'Florian Grieve', 'Bathing', 'Shorewood', t(17, 30), t(19), 'confirmed'],
    ],
    tomas: [
        ['Imelda R.', 'Imelda Ruiz', 'Companionship', 'West Allis', t(8), t(9), 'completed'],
        ['Casimir O.', 'Casimir Olszewski', 'Personal care', 'West Allis', t(9, 30), t(11), 'completed'],
        ["Beatrice O'N.", "Beatrice O'Neill", 'Meal prep', 'West Allis', t(17), t(18), 'confirmed'],
    ],
    yusuf: [
        ['Mortimer K.', 'Mortimer Kline', 'Personal care', 'Bay View', t(11), t(12), 'completed'],
    ],
}

export const visits: Visit[] = Object.entries(shifts).flatMap(([caregiver, rows]) =>
    rows.map(([client, clientFull, service, area, start, end, status, extra], i) => ({
        id: `${caregiver}-${i}`,
        caregiver,
        client,
        clientFull,
        service,
        area,
        start,
        end,
        status,
        evv: status === 'completed' ? 'Verified at the door' : status === 'confirmed' ? 'Scheduled' : undefined,
        ...extra,
    }))
)

/** What the bell shows. */
export const alerts = [
    { id: 'a1', tone: 'danger', title: 'Missed visit · Maud P.', body: 'No clock-in from Bronagh by 11:31 AM.', time: '11:46 AM' },
    { id: 'a2', tone: 'warning', title: 'Running late · Davi Monteiro', body: 'Not clocked in at Ottilie B. yet.', time: '1:38 PM' },
    { id: 'a3', tone: 'info', title: 'Desmond Okonjo called out', body: '3 visits reassigned to Marisol, Emil and Bronagh.', time: '8:52 AM' },
    { id: 'a4', tone: 'info', title: 'Follow-up to review', body: 'Marisol left a note on Marguerite H.', time: '12:04 PM' },
] as const

/* --------------------------------- Formats --------------------------------- */

/** "7:30", "12:30" — the board's compact clock, no meridiem. */
export const clock = (minutes: number) => `${Math.floor(minutes / 60) % 12 || 12}:${String(minutes % 60).padStart(2, '0')}`
/** "10:00 AM". */
export const clockFull = (minutes: number) => `${clock(minutes)} ${minutes < 12 * 60 ? 'AM' : 'PM'}`
/** "7 AM". */
export const hourLabel = (hour: number) => `${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`
export const initials = (name: string) =>
    name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

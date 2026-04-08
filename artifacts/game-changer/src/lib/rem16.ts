export type ThinkingFocus = "Proof" | "Process" | "People" | "Possibility";
export type Orientation = "Eager" | "Cautious";
export type ChangeRole = "Rockstar" | "Roadie";

interface MentalModelEntry {
  name: string;
  description: string;
}

const rem16Map: Record<string, MentalModelEntry> = {
  "Proof-Eager-Rockstar": {
    name: "The Architect",
    description: "You build change on solid foundations of evidence. You energetically communicate data-driven rationale and inspire others through logical arguments. Your role is to validate and promote the change with credibility."
  },
  "Proof-Eager-Roadie": {
    name: "The Explorer",
    description: "You support change by quietly gathering and sharing evidence behind the scenes. You build confidence in others through thorough research without seeking the spotlight yourself."
  },
  "Proof-Cautious-Rockstar": {
    name: "The Sceptic",
    description: "You ask the hard questions publicly. You need solid evidence before committing, and your visible scrutiny ensures that the change is rigorous and well-founded. Others look to you to catch flaws."
  },
  "Proof-Cautious-Roadie": {
    name: "The Forecaster",
    description: "You have reservations about the change but express them through careful analysis in small groups. You need data and reassurance before you can fully commit to supporting the change."
  },
  "Process-Eager-Rockstar": {
    name: "The Implementer",
    description: "You champion change through structure. You visibly lead the implementation of plans, processes, and governance frameworks, ensuring the change is delivered in an organised and reliable way."
  },
  "Process-Eager-Roadie": {
    name: "The Perfectionist",
    description: "You support change by diligently following and completing processes. You are the backbone of implementation — reliable, thorough, and consistent in delivering on your commitments."
  },
  "Process-Cautious-Rockstar": {
    name: "The Bureaucrat",
    description: "You are a visible advocate for careful, risk-aware change. You raise concerns about process gaps and implementation risks publicly, helping the team avoid costly mistakes."
  },
  "Process-Cautious-Roadie": {
    name: "The Driver",
    description: "You follow instructions but have serious concerns about whether the change has been properly planned. You need clear processes and assurances before you can fully engage with the change."
  },
  "People-Eager-Rockstar": {
    name: "The Facilitator",
    description: "You bring emotional energy and enthusiasm to change. You visibly rally people, build morale, and create a sense of community and belonging around the change journey."
  },
  "People-Eager-Roadie": {
    name: "The Humanitarian",
    description: "You support change by nurturing relationships behind the scenes. You listen, support, and connect people informally, helping teams feel safe and supported through the transition."
  },
  "People-Cautious-Rockstar": {
    name: "The Preservationist",
    description: "You visibly advocate for the wellbeing of your team during change. You are cautious about impacts on people and ensure that the human cost of change is recognised and addressed."
  },
  "People-Cautious-Roadie": {
    name: "The Shepherd",
    description: "You are deeply concerned about how the change will affect people, and you guide them through it quietly. You need reassurance that people's wellbeing is being looked after before you can engage."
  },
  "Possibility-Eager-Rockstar": {
    name: "The Creator",
    description: "You are the visionary champion of change. You see exciting possibilities and actively promote a bold new future, inspiring others with your creativity and enthusiasm for what could be."
  },
  "Possibility-Eager-Roadie": {
    name: "The Guru",
    description: "You are inspired by the possibilities of change and support it with deep insight behind the scenes. You generate ideas and creative solutions, though you prefer others to take the visible lead."
  },
  "Possibility-Cautious-Rockstar": {
    name: "The Fearful Optimist",
    description: "You see the potential in change but are cautious about how it is being executed. You challenge assumptions publicly and push for more creative and ambitious approaches to the change vision."
  },
  "Possibility-Cautious-Roadie": {
    name: "The Lost Soul",
    description: "You are drawn to the possibilities of change but hold back due to uncertainty or past disappointments. You need to see the vision articulated more clearly before you can fully commit your creative energy."
  },
};

export function getMentalModel(
  thinkingFocus: ThinkingFocus,
  orientation: Orientation,
  changeRole: ChangeRole
): MentalModelEntry {
  const key = `${thinkingFocus}-${orientation}-${changeRole}`;
  return rem16Map[key] ?? {
    name: "Unknown Model",
    description: "We could not determine your mental model from the provided inputs."
  };
}

import { z } from 'zod';
export declare const PlanStepSchema: z.ZodObject<{
    name: z.ZodString;
    verb: z.ZodEnum<["install", "build", "run", "test"]>;
    args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    workdir: z.ZodOptional<z.ZodString>;
    timeout: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    verb: "install" | "build" | "run" | "test";
    args?: string[] | undefined;
    env?: Record<string, string> | undefined;
    workdir?: string | undefined;
    timeout?: number | undefined;
}, {
    name: string;
    verb: "install" | "build" | "run" | "test";
    args?: string[] | undefined;
    env?: Record<string, string> | undefined;
    workdir?: string | undefined;
    timeout?: number | undefined;
}>;
export declare const PlanSchema: z.ZodObject<{
    version: z.ZodLiteral<"1.0">;
    name: z.ZodString;
    runtime: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        verb: z.ZodEnum<["install", "build", "run", "test"]>;
        args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        workdir: z.ZodOptional<z.ZodString>;
        timeout: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        verb: "install" | "build" | "run" | "test";
        args?: string[] | undefined;
        env?: Record<string, string> | undefined;
        workdir?: string | undefined;
        timeout?: number | undefined;
    }, {
        name: string;
        verb: "install" | "build" | "run" | "test";
        args?: string[] | undefined;
        env?: Record<string, string> | undefined;
        workdir?: string | undefined;
        timeout?: number | undefined;
    }>, "many">;
    ports: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    healthcheck: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    version: "1.0";
    runtime: string;
    steps: {
        name: string;
        verb: "install" | "build" | "run" | "test";
        args?: string[] | undefined;
        env?: Record<string, string> | undefined;
        workdir?: string | undefined;
        timeout?: number | undefined;
    }[];
    ports?: number[] | undefined;
    healthcheck?: string | undefined;
}, {
    name: string;
    version: "1.0";
    runtime: string;
    steps: {
        name: string;
        verb: "install" | "build" | "run" | "test";
        args?: string[] | undefined;
        env?: Record<string, string> | undefined;
        workdir?: string | undefined;
        timeout?: number | undefined;
    }[];
    ports?: number[] | undefined;
    healthcheck?: string | undefined;
}>;
export type Plan = z.infer<typeof PlanSchema>;
export type PlanStep = z.infer<typeof PlanStepSchema>;
export declare function validatePlan(data: unknown): Plan;
/**
 * Security validation for execution plans
 * Enforces SafeRun guardrails
 */
export declare function validatePlanSecurity(plan: Plan): {
    valid: boolean;
    errors: string[];
};
//# sourceMappingURL=planSchema.d.ts.map
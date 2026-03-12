import { SPFI } from "@pnp/sp";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/fields";
import "@pnp/sp/attachments";
import { IRiskItem } from "../models/IRiskItem";
import { getSP } from "../pnpjsConfig";

const LIST_TITLE = "RiskOpportunityRegister";

/**
 * Service for CRUD operations against the RiskOpportunityRegister SharePoint list.
 * Uses the PnPjs singleton — no need to pass context.
 */
export class SharePointService {
    private sp: SPFI;

    constructor() {
        this.sp = getSP();
    }

    /**
     * Creates a new risk/opportunity item in the SharePoint list.
     * @returns The ID of the newly created item.
     */
    public async createItem(item: IRiskItem): Promise<number> {
        // Step 1: Create the item without RecordNumber
        const addResult = await this.sp.web.lists.getByTitle(LIST_TITLE).items.add({
            ItemType: item.ItemType,
            RiskOrOpportunity: item.RiskOrOpportunity,
            Consequences: item.Consequences,
            Probability: item.Probability,
            Severity: item.Severity,
            RiskLevel: item.RiskLevel,
            Actions: item.Actions,
            Monitoring: item.Monitoring,
            Comments: item.Comments,
            RecordDate: item.RecordDate,
            InControl: item.InControl,
            // Optional fields — only include if provided
            ...(item.OwnerId !== undefined ? { OwnerId: item.OwnerId } : {}),
            ...(item.DueDate ? { DueDate: item.DueDate } : {}),
            ...(item.Status ? { Status: item.Status } : {}),
            ...(item.Category ? { Category: item.Category } : {}),
        });

        const newId: number = addResult.Id;

        // Step 2: Generate RecordNumber from the SharePoint item ID (e.g. ID=1 → "RO-000001")
        let numStr = newId.toString();
        while (numStr.length < 6) { numStr = "0" + numStr; }
        const recordNumber = `RO-${numStr}`;

        // Step 3: Update the item with the generated RecordNumber
        await this.sp.web.lists
            .getByTitle(LIST_TITLE)
            .items.getById(newId)
            .update({ RecordNumber: recordNumber });

        return newId;
    }

    /**
     * Retrieves a single item by its SharePoint ID, including Editor info.
     */
    public async getItemById(id: number): Promise<IRiskItem> {
        const data: Record<string, unknown> = await this.sp.web.lists
            .getByTitle(LIST_TITLE)
            .items.getById(id)
            .select(
                "Id", "RecordNumber", "ItemType", "RiskOrOpportunity", "Consequences",
                "Probability", "Severity", "RiskLevel", "Actions", "Monitoring",
                "Comments", "RecordDate", "InControl", "OwnerId", "DueDate",
                "Status", "Category", "Created", "Modified", "Editor/Title"
            )
            .expand("Editor")();

        return this.mapToRiskItem(data);
    }

    /**
     * Retrieves items with optional filters. Returns a lightweight projection
     * suitable for list views (not all multiline fields).
     */
    public async getItems(params?: {
        itemType?: "R" | "O";
        riskLevel?: string;
        inControl?: boolean;
        category?: string;
        top?: number;
    }): Promise<IRiskItem[]> {
        const top = params?.top ?? 200;
        const selectFields = [
            "Id", "RecordNumber", "ItemType", "RiskOrOpportunity",
            "Probability", "Severity", "RiskLevel", "InControl",
            "RecordDate", "Status", "DueDate", "Category", "Modified",
        ].join(",");

        // Build OData filters
        const filters: string[] = [];
        if (params?.itemType) filters.push(`ItemType eq '${params.itemType}'`);
        if (params?.riskLevel) filters.push(`RiskLevel eq '${params.riskLevel}'`);

        let query = this.sp.web.lists
            .getByTitle(LIST_TITLE)
            .items.select(selectFields)
            .top(top)
            .orderBy("Id", false);

        if (filters.length > 0) {
            query = query.filter(filters.join(" and "));
        }

        const data: Record<string, unknown>[] = await query();

        return data.map((d) => this.mapToRiskItem(d));
    }

    /**
     * Updates an existing item.
     */
    public async updateItem(id: number, item: IRiskItem): Promise<void> {
        await this.sp.web.lists
            .getByTitle(LIST_TITLE)
            .items.getById(id)
            .update({
                ItemType: item.ItemType,
                RiskOrOpportunity: item.RiskOrOpportunity,
                Consequences: item.Consequences,
                Probability: item.Probability,
                Severity: item.Severity,
                RiskLevel: item.RiskLevel,
                Actions: item.Actions,
                Monitoring: item.Monitoring,
                Comments: item.Comments,
                RecordDate: item.RecordDate,
                InControl: item.InControl,
                ...(item.OwnerId !== undefined ? { OwnerId: item.OwnerId } : {}),
                ...(item.DueDate ? { DueDate: item.DueDate } : {}),
                ...(item.Status ? { Status: item.Status } : {}),
                ...(item.Category ? { Category: item.Category } : {}),
            });
    }

    /**
     * Deletes an item by ID. Should only be called after AuthzService confirms Admin role.
     */
    public async deleteItem(id: number): Promise<void> {
        await this.sp.web.lists
            .getByTitle(LIST_TITLE)
            .items.getById(id)
            .delete();
    }

    /**
     * Adds a file attachment to a list item.
     */
    public async addAttachment(
        itemId: number,
        fileName: string,
        content: ArrayBuffer
    ): Promise<void> {
        await this.sp.web.lists
            .getByTitle(LIST_TITLE)
            .items.getById(itemId)
            .attachmentFiles.add(fileName, content);
    }

    // RecordNumber is a Calculated column — SharePoint generates it automatically.
    // No getNextRecordNumber method needed.

    /**
     * Maps a raw SharePoint item to the IRiskItem interface.
     */
    private mapToRiskItem(d: Record<string, unknown>): IRiskItem {
        return {
            Id: d.Id as number,
            RecordNumber: (d.RecordNumber as string) ?? "",
            ItemType: (d.ItemType as IRiskItem["ItemType"]) ?? "R",
            RiskOrOpportunity: (d.RiskOrOpportunity as string) ?? "",
            Consequences: (d.Consequences as string) ?? "",
            Probability: (d.Probability as IRiskItem["Probability"]) ?? "BAJA (1)",
            Severity: (d.Severity as IRiskItem["Severity"]) ?? "BAJA (1)",
            RiskLevel: (d.RiskLevel as IRiskItem["RiskLevel"]) ?? "Trivial",
            Actions: (d.Actions as string) ?? "",
            Monitoring: (d.Monitoring as string) ?? "",
            Comments: (d.Comments as string) ?? "",
            RecordDate: (d.RecordDate as string) ?? "",
            InControl: d.InControl === true,
            OwnerId: d.OwnerId as number | undefined,
            DueDate: d.DueDate as string | undefined,
            Status: d.Status as IRiskItem["Status"],
            Category: d.Category as string | undefined,
            Created: d.Created as string | undefined,
            Modified: d.Modified as string | undefined,
            EditorTitle: (d.Editor as { Title?: string })?.Title,
        };
    }
}

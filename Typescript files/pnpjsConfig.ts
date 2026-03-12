import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI, SPFx } from "@pnp/sp";
import { LogLevel, PnPLogging } from "@pnp/logging";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import "@pnp/sp/site-groups/web";

// eslint-disable-next-line no-var
var _sp: SPFI | null = null;

/**
 * Returns a singleton SPFI instance configured with the SPFx context.
 * Must be called once with the context during onInit(), then can be called
 * without arguments from anywhere in the application.
 *
 * Usage:
 *   // In WebPart onInit():
 *   getSP(this.context);
 *
 *   // In services/components:
 *   const sp = getSP();
 */
export const getSP = (context?: WebPartContext): SPFI => {
    if (context !== undefined) {
        _sp = spfi().using(SPFx(context)).using(PnPLogging(LogLevel.Warning));
    }

    if (_sp === null) {
        throw new Error("PnPjs not initialized. Call getSP(context) in onInit() first.");
    }

    return _sp;
};

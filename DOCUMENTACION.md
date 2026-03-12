# Documentación del Proyecto - Sistema de Acciones Correctivas

## Descripción General

Este proyecto es una aplicación SharePoint Framework (SPFx) que implementa un sistema completo de gestión de Acciones Correctivas (CAPA - Corrective and Preventive Actions) integrado con SharePoint Online.

## Información Técnica

### Stack Tecnológico

- **SharePoint Framework (SPFx)**: 1.18.2
- **React**: 17.0.1
- **TypeScript**: 4.7.4
- **Fluent UI React**: 8.123.6
- **PnPjs**: 3.26.0
- **PnP SPFx Controls React**: 3.21.0
- **Node.js**: 18.20.8 (requerido)
- **Gulp**: Sistema de construcción

### Estructura del Proyecto

```
Ciracet -corrective-action/
├── src/
│   └── webparts/
│       └── correctiveActionForm/
│           ├── components/
│           │   ├── CorrectiveActionForm.tsx       # Formulario principal
│           │   ├── CorrectiveActionDashboard.tsx  # Dashboard de visualización
│           │   └── FormFields.tsx                 # Componentes reutilizables
│           ├── services/
│           │   └── SharePointService.ts           # Servicio de datos SharePoint
│           ├── models/
│           │   └── ICorrectiveAction.ts           # Interfaces TypeScript
│           └── CorrectiveActionFormWebPart.ts     # Web Part principal
├── config/
│   ├── package-solution.json                      # Configuración del paquete
│   └── serve.json                                 # Configuración de desarrollo
├── sharepoint/
│   └── solution/
│       └── corrective-action-form.sppkg           # Paquete de solución
└── package.json                                   # Dependencias del proyecto
```

## Listas de SharePoint Requeridas

### 1. Lista "Non Conformities" (No Conformidades)

Campos principales:
- **ReferenceID** (Texto): Identificador único de la no conformidad
- **Title** (Texto): Título de la no conformidad
- **Description** (Texto multilínea): Descripción del problema
- **CauseandEffectAnalysis#1** a **CauseandEffectAnalysis#5** (Texto multilínea): Análisis de causa y efecto
- **RootCause** (Texto multilínea): Causa raíz identificada
- **SeverityofNC** (Texto): Severidad de la no conformidad
- **Assignedto** (Persona): Persona asignada
- **TargetResolutionDate** (Fecha): Fecha objetivo de resolución
- **Status** (Texto): Estado actual

### 2. Lista "Corrective Actions" (Acciones Correctivas)

Campos principales:

#### Información Básica
- **Title** (Texto): Título de la acción correctiva
- **ReferenceID** (Texto): ID de referencia generado automáticamente
- **Status** (Texto): Estado (Open, In Progress, Closed)
- **NCReportNumber** (Búsqueda): Referencia a la lista de No Conformidades
- **PlaceOfNC** (Texto): Lugar de la no conformidad
- **ResponsiblePerson** (Persona): Persona responsable
- **DueDate** (Fecha): Fecha de vencimiento
- **CompletionDate** (Fecha): Fecha de completación
- **VerifiedBy** (Persona): Verificado por

#### Descripción y Análisis
- **IssueDescription** (Texto multilínea): Descripción del problema
- **CauseAndEffectAnalysis1** a **CauseAndEffectAnalysis5** (Texto multilínea): Análisis de causa y efecto
- **FollowUpNeededForCause2** a **FollowUpNeededForCause5** (Texto): YES/NO para seguimiento
- **RootCause** (Texto multilínea): Causa raíz

#### Plan de Acción
- **ActionPlanStep1** a **ActionPlanStep5** (Texto multilínea): Pasos del plan de acción
- **ActionPlan1Responsible** a **ActionPlan5Responsible** (Persona): Responsables de cada paso
- **DueDatePlan1**, **ActionPlan2DueDate** a **ActionPlan5DueDate** (Fecha): Fechas de vencimiento
- **FollowUpNeededAction2** a **FollowUpNeededAction5** (Texto): YES/NO para seguimiento

#### Verificación y Auditoría
- **ActionEffectivenessVerification** (Texto multilínea): Verificación de efectividad
- **ActionEffectivenessVerificationDate** (Fecha): Fecha de verificación
- **QAAuditor** (Texto): Auditor de calidad
- **Comments** (Texto multilínea): Comentarios adicionales

#### Información Adicional
- **CCList** (Texto): Lista de personas en copia (separadas por ;)
- **CAPAStatus** (Texto): Estado CAPA (Open, In Progress, Closed, Cancelled)
- **IsRiskAlreadyIdentified** (Texto): YES/NO
- **UpdateRiskAnalysisMatrix** (Texto multilínea): Actualización de matriz de riesgo

## Funcionalidades Principales

### 1. Dashboard de Acciones Correctivas

**Ubicación**: Vista por defecto del Web Part

**Características**:
- Muestra las acciones correctivas creadas por el usuario actual O donde el usuario es responsable (seguridad a nivel de fila)
- Tabla interactiva con las siguientes columnas:
  - ID de Referencia
  - Título
  - Número de Reporte NC
  - Estado
  - Fecha de Vencimiento
  - Persona Responsable
- Botones de acción:
  - **New**: Crear nueva acción correctiva
  - **Edit**: Editar acción existente
  - **Delete**: Eliminar acción (con confirmación)

### 2. Formulario de Acción Correctiva

**Características**:

#### Auto-población desde No Conformidades
Al seleccionar un "NC Report Number", el sistema automáticamente puebla:
- ID de Referencia (generado como AC-[NC-ID])
- Título
- Descripción del Problema
- Análisis de Causa y Efecto (1-5)
- Causa Raíz
- Persona Responsable
- Fecha de Vencimiento

#### Selectores de Personas (People Picker)
Campos con búsqueda inteligente de usuarios de la organización:
- Persona Responsable
- Verificado Por
- Responsables del Plan de Acción (pasos 1-5)
- Lista CC (selección múltiple hasta 10 personas)

**Configuración del PeoplePicker**:
```typescript
<PeoplePicker
  context={props.context}
  titleText="Responsible Person"
  personSelectionLimit={1}
  showtooltip={true}
  required={false}
  ensureUser={true}  // CRÍTICO: Devuelve ID numérico del usuario
  onChange={(items) => {
    if (items && items.length > 0) {
      updateField('ResponsiblePerson', items[0].id);
    }
  }}
  principalTypes={[PrincipalType.User]}
  resolveDelay={300}
  webAbsoluteUrl={props.context.pageContext.web.absoluteUrl}  // IMPORTANTE: Requerido para búsqueda
/>
```

**Props críticos**:
- `ensureUser={true}`: **OBLIGATORIO** - Hace que el control devuelva el ID numérico del usuario local del sitio. Sin esto, `items[0].id` devuelve el loginName (string/email) en lugar del ID numérico que SharePoint necesita para guardar en campos Person.
- `webAbsoluteUrl`: **OBLIGATORIO** - Especifica la URL del sitio para la búsqueda. Sin este prop, se producirá un error 404 en el endpoint `ClientPeoplePickerSearchUser`.

**Uso del PeoplePicker**:
1. Escribe el nombre del usuario en el campo
2. Aparecerán sugerencias automáticamente
3. Usa las flechas ↓↑ para navegar entre sugerencias
4. Presiona Enter o haz clic para seleccionar
5. Para múltiples usuarios (CCList), repite el proceso

#### Campos Condicionales
- Los campos de análisis de causa 2-5 solo se muestran si se selecciona "YES" en el seguimiento
- Los pasos de plan de acción 2-5 solo se muestran si se selecciona "YES" en el seguimiento

#### Validación del Formulario
Campos obligatorios:
- Título
- NC Report Number
- Corrective Action Reference ID (auto-generado)

### 3. Servicio de SharePoint

**Archivo**: `src/webparts/correctiveActionForm/services/SharePointService.ts`

**Métodos principales**:

```typescript
// Obtener lista de no conformidades para dropdown
public async getNonConformities(): Promise<IDropdownOption[]>

// Obtener detalles de no conformidad por ID de referencia
public async getNonConformityByReferenceId(referenceId: string): Promise<INonConformity | null>

// Generar ID de referencia de acción correctiva
public generateCorrectiveActionReferenceId(ncReferenceId: string): string

// CRUD de acciones correctivas
public async getCorrectiveActions(): Promise<ICorrectiveAction[]>
public async getCorrectiveActionById(id: number): Promise<ICorrectiveAction | null>
public async createCorrectiveAction(data: ICorrectiveAction): Promise<number>
public async updateCorrectiveAction(id: number, data: ICorrectiveAction): Promise<void>
public async deleteCorrectiveAction(id: number): Promise<void>
```

**Nota sobre nombres de campos internos de SharePoint**:
SharePoint codifica caracteres especiales en nombres de campos:
- Espacios → `_x0020_`
- `#` → `_x0023_`

Ejemplo: `Cause and Effect Analysis #1` → `CauseandEffectAnalysis_x0023_1`

## Instalación y Configuración

### Requisitos Previos

1. **Node.js 18.20.8**
   ```bash
   nvm install 18.20.8
   nvm use 18.20.8
   ```

2. **Gulp CLI**
   ```bash
   npm install -g gulp-cli
   ```

3. **Yeoman y generador de SPFx**
   ```bash
   npm install -g yo @microsoft/generator-sharepoint
   ```

### Instalación del Proyecto

1. **Clonar o descargar el proyecto**

2. **Instalar dependencias**
   ```bash
   cd "Ciracet -corrective-action"
   npm install
   ```

3. **Instalar paquete PnP Controls** (si no está instalado)
   ```bash
   npm install @pnp/spfx-controls-react --save
   ```

### Desarrollo Local

1. **Iniciar servidor de desarrollo**
   ```bash
   gulp serve
   ```
   Esto abrirá el SharePoint Workbench en `https://localhost:4321/temp/workbench.html`

2. **Probar en SharePoint Online**
   - Navegar a: `https://[tu-tenant].sharepoint.com/sites/[tu-sitio]/_layouts/15/workbench.aspx`
   - Agregar el Web Part "Corrective Action Form"

**Nota**: El PeoplePicker no funcionará correctamente en el workbench local. Debe probarse en el workbench hosteado de SharePoint.

### Compilación y Empaquetado para Producción

**Método 1: Comandos individuales**

1. **Limpiar build anterior**
   ```bash
   gulp clean
   ```

2. **Compilar para producción**
   ```bash
   gulp bundle --ship
   ```

3. **Empaquetar solución**
   ```bash
   gulp package-solution --ship
   ```

**Método 2: Script npm (recomendado)**

```bash
npm run package
```

Este comando ejecuta automáticamente: `gulp bundle --ship && gulp package-solution --ship`

**Importante**: Asegurarse de usar Node.js 18.20.8:
```bash
nvm use 18
# o si hay un archivo .nvmrc
nvm use
```

**Resultado**: Se generará el archivo `sharepoint/solution/corrective-action-form.sppkg`

### Despliegue en SharePoint

1. **Subir paquete al App Catalog**
   - Ir a: `https://[tu-tenant].sharepoint.com/sites/appcatalog`
   - Subir el archivo `.sppkg` a "Apps for SharePoint"
   - Marcar "Make this solution available to all sites in the organization" si es necesario
   - Hacer clic en "Deploy"

2. **Agregar aplicación al sitio**
   - Ir al sitio de SharePoint donde se usará
   - Configuración del sitio → Contenidos del sitio → Nueva → Aplicación
   - Buscar "corrective-action-form" y agregarla

3. **Agregar Web Part a una página**
   - Editar página o crear nueva
   - Agregar Web Part → Buscar "Corrective Action Form"
   - Publicar página

## Solución de Problemas Comunes

### Problema: PeoplePicker no muestra sugerencias

**Error**: `Failed to load resource: 404 (ClientPeoplePickerSearchUser)`

**Solución**: Asegurarse de que el prop `webAbsoluteUrl` está configurado:
```typescript
webAbsoluteUrl={props.context.pageContext.web.absoluteUrl}
```

### Problema: PeoplePicker no guarda los usuarios seleccionados

**Síntoma**: Los usuarios seleccionados en el PeoplePicker no se guardan en SharePoint

**Causa**: Falta el prop `ensureUser={true}`, por lo que el control devuelve el loginName (string) en lugar del ID numérico

**Solución**: Agregar `ensureUser={true}` al PeoplePicker:
```typescript
<PeoplePicker
  context={props.context as any}
  ensureUser={true}  // CRÍTICO: Devuelve ID numérico
  webAbsoluteUrl={props.context.pageContext.web.absoluteUrl}
  onChange={(items) => {
    if (items && items.length > 0) {
      updateField('ResponsiblePerson', items[0].id); // Ahora items[0].id es número
    }
  }}
  // ... otros props
/>
```

**Para campos Person multi-valor (CCList)**:
```typescript
// En el componente
onChange={(items) => {
  if (items && items.length > 0) {
    const ids = items.map(item => item.id).join(';');
    updateField('CCList', ids);
  }
}}

// En SharePointService.ts
CCListId: data.CCList ? {
  results: data.CCList.split(';').filter(id => id).map(id => parseInt(id))
} : null
```

### Problema: Auto-población no funciona

**Causa**: Nombres de campos internos de SharePoint no coinciden

**Solución**: Verificar nombres de campos usando la consola del navegador:
```javascript
console.log('Available fields:', Object.keys(item));
```

### Problema: Error de versión de Node

**Error**: `Your dev environment is running NodeJS version v22.x.x which does not meet the requirements`

**Solución**: Usar Node.js 18.20.8
```bash
nvm use 18
# o si está usando .nvmrc
nvm use
```

### Problema: Errores de TypeScript en compilación

**Causa común**: Propiedades duplicadas en componentes JSX

**Solución**: Verificar que no haya atributos duplicados en los componentes, especialmente después de usar comandos `sed`.

## Mantenimiento y Extensiones Futuras

### Agregar nuevos campos al formulario

1. **Actualizar interfaz** en `src/webparts/correctiveActionForm/models/ICorrectiveAction.ts`:
   ```typescript
   export interface ICorrectiveAction {
     // ... campos existentes
     NuevoCampo: string;
   }
   ```

2. **Actualizar estado inicial** en `CorrectiveActionForm.tsx`

3. **Agregar campo al formulario** usando componentes de `FormFields.tsx`

4. **Actualizar métodos del servicio** en `SharePointService.ts` para incluir el nuevo campo

### Agregar validaciones personalizadas

Modificar la función `validateForm()` en `CorrectiveActionForm.tsx`:
```typescript
const validateForm = (): boolean => {
  if (!formData.Title) {
    setError('Title is required');
    return false;
  }
  // Agregar más validaciones aquí
  return true;
};
```

### Personalizar estilos

Los estilos se pueden agregar en:
- `src/webparts/correctiveActionForm/components/CorrectiveActionForm.module.scss`
- Inline usando el prop `styles` de Fluent UI

## Seguridad

### Permisos Requeridos

El Web Part requiere:
- **Lectura**: Lista "Non Conformities"
- **Lectura/Escritura**: Lista "Corrective Actions"
- **Lectura de usuarios**: Para el PeoplePicker

### Seguridad a nivel de fila

El dashboard filtra automáticamente para mostrar solo registros donde:
- `(Author/Id eq ${currentUser.Id}) or (ResponsiblePerson eq ${currentUser.Id})`

Esto asegura que cada usuario vea:
1. Las acciones correctivas que **creó** (es el autor)
2. Las acciones correctivas donde **es responsable** (está asignado como ResponsiblePerson)

**Implementación en SharePointService.ts**:
```typescript
public async getMyCorrectiveActions(): Promise<ICorrectiveAction[]> {
  const currentUser = await this.sp.web.currentUser();

  const items = await this.sp.web.lists
    .getByTitle('Corrective Actions')
    .items
    .filter(`(Author/Id eq ${currentUser.Id}) or (ResponsiblePerson eq ${currentUser.Id})`)
    .select('*', 'Noconformidades/ReferenceID', 'Noconformidades/Title')
    .expand('Noconformidades')
    .top(50)();

  return items.map(item => this.mapToCorrectiveAction(item));
}
```

## Contacto y Soporte

Para preguntas o problemas:
1. Revisar esta documentación
2. Verificar la consola del navegador para errores específicos
3. Consultar logs del servidor de desarrollo con `gulp serve`

## Licencia

Este proyecto es propiedad de Ciracet y está destinado para uso interno.

---

## Historial de Cambios

### Versión 1.0.0 (Octubre 2025)

**Características implementadas**:
- ✅ Dashboard con filtrado por usuario (creador O responsable)
- ✅ Formulario completo de Acción Correctiva
- ✅ Auto-población desde lista de No Conformidades
- ✅ People Picker con búsqueda de usuarios de la organización
- ✅ Campos condicionales (Causa #2-5, Acción #2-5)
- ✅ Validación de formularios
- ✅ Operaciones CRUD completas
- ✅ Generación automática de ID de referencia (AC-xxx)
- ✅ Integración completa con SharePoint Lists

**Correcciones aplicadas**:
- ✅ Mapeo correcto de campos internos de SharePoint (encoding de caracteres especiales)
- ✅ Configuración de `webAbsoluteUrl` en todos los PeoplePickers
- ✅ Configuración de `ensureUser={true}` en todos los PeoplePickers para guardar IDs correctamente
- ✅ Manejo correcto de campos Person multi-valor (CCList) con formato `{ results: [id1, id2] }`
- ✅ Filtro de dashboard actualizado para mostrar acciones asignadas
- ✅ Actualización de dependencias (PnPjs 3.26.0, PnP Controls 3.21.0)

**Estado del paquete**:
- Archivo: `sharepoint/solution/corrective-action-form.sppkg` (~460 KB)
- Build: ✅ Exitoso sin errores
- Listo para despliegue en producción

**Problemas conocidos resueltos**:
- ✅ PeoplePicker 404 error → Solucionado con `webAbsoluteUrl`
- ✅ PeoplePicker no guarda usuarios → Solucionado con `ensureUser={true}`
- ✅ Dashboard solo muestra acciones creadas → Ahora muestra creadas O asignadas
- ✅ Auto-población no funcionaba → Mapeo de campos corregido

---

**Última actualización**: 3 de Octubre de 2025
**Versión del proyecto**: 1.0.0
**Mantenido por**: Equipo de Desarrollo Ciracet

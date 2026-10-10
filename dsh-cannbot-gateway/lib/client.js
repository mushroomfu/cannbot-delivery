window.__ModuleLoader__.load({
	id: "dsh-cannbot-gateway",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region lib/types/client/styles.js
		const css = ".cbgw-card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:10px;padding:0 14px 12px;display:flex;flex-direction:column}.cbgw-readOnly{color:var(--dsw-alias-label-tertiary);margin:10px 0 0;font-size:12px}.cbgw-field{display:flex;flex-direction:column;gap:6px;padding:12px 0}.cbgw-field+.cbgw-field{border-top:1px solid var(--dsw-alias-border-l2)}.cbgw-head{display:flex;align-items:center;gap:8px}.cbgw-label{min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:500;line-height:1.5}.cbgw-badges{display:inline-flex;align-items:center;gap:8px}.cbgw-badge{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}.cbgw-badgeMuted{white-space:nowrap;color:var(--dsw-alias-label-tertiary);border-radius:999px;padding:1px 8px;font-size:11px;line-height:17px}.cbgw-reset{font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0;border:none;padding:0;font-size:12px;line-height:1.5}.cbgw-reset:hover:not(:disabled){color:var(--dsw-alias-label-primary)}.cbgw-reset:disabled{cursor:default}.cbgw-input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}.cbgw-input:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}.cbgw-textarea{height:auto;min-height:96px;max-height:280px;padding:8px 12px;resize:vertical;font-family:var(--dsw-font-mono, ui-monospace, monospace);line-height:1.6}.cbgw-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}.cbgw-invalid{color:var(--dsw-alias-label-error);margin:0;font-size:12px;line-height:1.5}.cbgw-footer{display:flex;justify-content:flex-end;align-items:center;gap:8px;padding-top:10px}.cbgw-pending{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px;margin-right:auto}.cbgw-failed{color:var(--dsw-alias-label-error);margin:0 auto 0 0;font-size:12px}.cbgw-button{font:inherit;font-size:12px;cursor:pointer;border-radius:8px;padding:5px 12px;border:1px solid var(--dsw-alias-border-l2);background:0;color:var(--dsw-alias-label-secondary)}.cbgw-button:hover:not(:disabled){color:var(--dsw-alias-label-primary)}.cbgw-button:disabled{cursor:default;opacity:.5}.cbgw-primary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-on-brand, #fff)}.cbgw-primary:hover:not(:disabled){color:var(--dsw-alias-label-on-brand, #fff);filter:brightness(1.05)}";
		const tagId = "dsh-cannbot-gateway/card.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-cannbot-gateway";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region lib/types/client/locales.js
		const NS_LOCALE = "dsh-cannbot-gateway";
		const zh = {
			cardTitle: "Cannbot 网关",
			cardDescription: "cannbot 虚拟密钥、网关连接与模型列表",
			unavailable: "该插件当前未加载，暂时无法配置。",
			readOnly: "本部署的设置为只读。",
			unsaved: "未保存",
			save: "保存",
			saving: "保存中…",
			discard: "放弃修改",
			saveFailed: "本部署没有接受这些值，已保留供你修改。",
			invalid: "输入无效，请修正后再保存。",
			overridden: "已覆盖",
			reset: "恢复默认",
			vkLabel: "虚拟密钥（x-api-vkey）",
			vkHint: "只写入本机凭据库，不进入设置文件。留空保存表示保持当前密钥。",
			vkSet: "已配置密钥。",
			vkUnset: "未配置密钥；配置之前 cannbot 路由不可用。",
			displayNameLabel: "分组名称",
			displayNameHint: "模型选择器里的分组名。",
			gatewayURLLabel: "网关地址",
			gatewayURLHint: "OpenAI 兼容网关地址。",
			sessionFileLabel: "登录态文件",
			sessionFileHint: "cannbot 的 session.json 路径，留默认自动探测新/旧位置。",
			modelsLabel: "模型列表",
			modelsHint: "每行一个模型：模型ID | 名称 | 上下文窗口 | 最大输出；后三项可省略（默认 1048576 / 393216）。保存后立即生效。",
			modelsInvalid: "模型列表格式不正确：每行至少填写模型ID，可选项用“ | ”分隔，最多四列。"
		};
		const en = {
			cardTitle: "Cannbot Gateway",
			cardDescription: "cannbot virtual key, gateway connection, and model list",
			unavailable: "This plugin is not loaded, so it cannot be configured right now.",
			readOnly: "This deployment stores settings read-only.",
			unsaved: "Unsaved",
			save: "Save",
			saving: "Saving…",
			discard: "Discard",
			saveFailed: "The deployment did not accept these values; they were left for you to correct.",
			invalid: "Enter a valid value before saving.",
			overridden: "Overridden",
			reset: "Reset to default",
			vkLabel: "Virtual key (x-api-vkey)",
			vkHint: "Stored outside the settings file. Leave blank to keep the current key.",
			vkSet: "A key is configured.",
			vkUnset: "No key is configured; the cannbot route stays off until one is.",
			displayNameLabel: "Group name",
			displayNameHint: "The group label in the model picker.",
			gatewayURLLabel: "Gateway URL",
			gatewayURLHint: "OpenAI-compatible gateway endpoint.",
			sessionFileLabel: "Session file",
			sessionFileHint: "Path of cannbot's session.json; new and legacy locations are probed by default.",
			modelsLabel: "Model list",
			modelsHint: "One model per line: id | name | context window | max output; the last two are optional (defaults 1048576 / 393216). Saving applies the list immediately.",
			modelsInvalid: "Invalid model list: each line needs at least a model id; optional columns are separated by \" | \", four at most."
		};
		//#endregion
		//#region lib/types/client/store.js
		/** Minimal snapshot store; the deployment's client-store package is first-party only. */
		function createSnapshotStore(initial) {
			let snapshot = initial;
			const listeners = new Set();
			return {
				getSnapshot: () => snapshot,
				set(next) {
					if (Object.is(next, snapshot)) return;
					snapshot = next;
					for (const listener of [...listeners]) listener();
				},
				subscribe(listener) {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				}
			};
		}
		//#endregion
		//#region lib/types/client/fields.js
		function ValueField(props) {
			const control = props.multiline
				? (0, react_jsx_runtime.jsx)("textarea", {
					id: props.id,
					className: "cbgw-input cbgw-textarea",
					rows: props.rows ?? 4,
					spellCheck: false,
					value: props.text,
					disabled: props.disabled,
					onChange: (event) => { props.onEdit(event.target.value); }
				})
				: (0, react_jsx_runtime.jsx)("input", {
					id: props.id,
					className: "cbgw-input",
					type: "text",
					value: props.text,
					disabled: props.disabled,
					onChange: (event) => { props.onEdit(event.target.value); }
				});
			return (0, react_jsx_runtime.jsxs)("div", { className: "cbgw-field", children: [
				(0, react_jsx_runtime.jsxs)("div", { className: "cbgw-head", children: [
					(0, react_jsx_runtime.jsx)("label", { className: "cbgw-label", htmlFor: props.id, children: props.label }),
					props.overridden ? (0, react_jsx_runtime.jsxs)("span", { className: "cbgw-badges", children: [
						(0, react_jsx_runtime.jsx)("span", { className: "cbgw-badge", children: props.overriddenLabel }),
						(0, react_jsx_runtime.jsx)("button", { type: "button", className: "cbgw-reset", disabled: props.disabled, onClick: props.onReset, children: props.resetLabel })
					] }) : null
				] }),
				control,
				props.invalid ? (0, react_jsx_runtime.jsx)("p", { className: "cbgw-invalid", children: props.invalidLabel }) : null,
				(0, react_jsx_runtime.jsx)("p", { className: "cbgw-hint", children: props.hint })
			] });
		}
		function SecretField(props) {
			return (0, react_jsx_runtime.jsxs)("div", { className: "cbgw-field", children: [
				(0, react_jsx_runtime.jsxs)("div", { className: "cbgw-head", children: [
					(0, react_jsx_runtime.jsx)("label", { className: "cbgw-label", htmlFor: props.id, children: props.label }),
					(0, react_jsx_runtime.jsx)("span", { className: "cbgw-badges", children: (0, react_jsx_runtime.jsx)("span", {
						className: props.configured ? "cbgw-badge" : "cbgw-badgeMuted",
						children: props.stateLabel
					}) })
				] }),
				(0, react_jsx_runtime.jsx)("input", {
					id: props.id,
					className: "cbgw-input",
					type: "password",
					autoComplete: "off",
					value: props.text,
					disabled: props.disabled,
					onChange: (event) => { props.onEdit(event.target.value); }
				}),
				(0, react_jsx_runtime.jsx)("p", { className: "cbgw-hint", children: props.hint })
			] });
		}
		//#endregion
		//#region lib/types/client/form.js
		function textField(field) {
			return {
				field,
				format: (value) => typeof value === "string" ? value : "",
				parse: (text) => {
					const trimmed = text.trim();
					return trimmed === "" ? { kind: "clear" } : { kind: "set", value: trimmed };
				}
			};
		}
		/** 模型列表编辑器:一行一个模型,`模型ID | 名称 | 上下文窗口 | 最大输出`,后三项可省略。 */
		function modelsField(field) {
			return {
				field,
				format: (value) => Array.isArray(value)
					? value
						.filter((model) => model && typeof model.id === "string" && model.id.trim() !== "")
						.map((model) => {
							const parts = [model.id.trim(), model.name ?? "", model.contextWindow ?? "", model.maxTokens ?? ""].map((part) => String(part));
							while (parts.length > 1 && parts[parts.length - 1] === "") parts.pop();
							return parts.join(" | ");
						})
						.join("\n")
					: "",
				parse: (text) => {
					const lines = text.split("\n").map((line) => line.trim()).filter((line) => line !== "");
					if (lines.length === 0) return { kind: "clear" };
					const models = [];
					for (const line of lines) {
						const parts = line.split("|").map((part) => part.trim());
						if (parts[0] === "" || parts.length > 4) return undefined;
						const model = { id: parts[0] };
						if (parts[1]) model.name = parts[1];
						if (parts[2] !== undefined) {
							const contextWindow = Number(parts[2]);
							if (!Number.isFinite(contextWindow) || contextWindow <= 0) return undefined;
							model.contextWindow = Math.floor(contextWindow);
						}
						if (parts[3] !== undefined) {
							const maxTokens = Number(parts[3]);
							if (!Number.isFinite(maxTokens) || maxTokens <= 0) return undefined;
							model.maxTokens = Math.floor(maxTokens);
						}
						models.push(model);
					}
					return { kind: "set", value: models };
				}
			};
		}
		/** 暂存式表单：控件只上报草稿，保存才写；密钥经凭据域，其余走 settings 用户层。 */
		var CardForm = class {
			scope;
			specs;
			secretSpecs;
			staged = new Map();
			listeners = new Set();
			saving = false;
			failed = false;
			unsubscribe;
			constructor(scope, specs, secrets = []) {
				this.scope = scope;
				this.specs = new Map(specs.map((spec) => [spec.field, spec]));
				this.secretSpecs = new Map(secrets.map((spec) => [spec.field, spec]));
				this.unsubscribe = scope.subscribe(() => { this.publish(); });
			}
			dispose() {
				this.unsubscribe?.();
				this.listeners.clear();
			}
			bind(project) {
				const store = createSnapshotStore(project());
				this.listeners.add(() => { store.set(project()); });
				return store;
			}
			shell() {
				const snapshot = this.scope.getSnapshot();
				const plan = this.plan();
				return {
					available: snapshot.status === "ready",
					writable: snapshot.writable,
					dirty: plan.length > 0,
					invalid: plan.some((item) => item.run === undefined),
					saving: this.saving,
					failed: this.failed
				};
			}
			field(field) {
				const staged = this.staged.get(field);
				if (this.secretSpecs.has(field)) return { text: staged?.text ?? "", overridden: false, invalid: false };
				const spec = this.specs.get(field);
				if (staged === undefined) return {
					text: spec.format(this.sectionValue(field)),
					overridden: this.stored(field),
					invalid: false
				};
				const write = staged.clear ? { kind: "clear" } : spec.parse(staged.text);
				return { text: staged.text, overridden: write?.kind === "set", invalid: write === undefined };
			}
			actions() {
				return {
					edit: (field, text) => {
						this.staged.set(field, { text, clear: false });
						this.failed = false;
						this.publish();
					},
					resetField: (field) => {
						this.staged.set(field, { text: this.specs.get(field).format(this.baseValue(field)), clear: true });
						this.failed = false;
						this.publish();
					},
					save: () => { void this.save(); },
					discard: () => {
						if (this.staged.size === 0 && !this.failed) return;
						this.staged.clear();
						this.failed = false;
						this.publish();
					}
				};
			}
			async save() {
				const plan = this.plan();
				const writes = plan.flatMap((item) => item.run === undefined ? [] : [item.run]);
				if (plan.length === 0 || this.saving || writes.length !== plan.length) return;
				this.saving = true;
				this.failed = false;
				this.publish();
				let landed = true;
				for (const write of writes) landed = await write() && landed;
				if (landed) this.staged.clear();
				this.saving = false;
				this.failed = !landed;
				this.publish();
			}
			plan() {
				const plan = [];
				for (const [field, staged] of this.staged) {
					const secret = this.secretSpecs.get(field);
					if (secret !== undefined) {
						const value = staged.text.trim();
						if (value !== "") plan.push({ field, run: () => secret.write(value) });
						continue;
					}
					const spec = this.specs.get(field);
					if (staged.clear) {
						if (this.stored(field)) plan.push({ field, run: () => this.clear(field) });
						continue;
					}
					if (staged.text === spec.format(this.sectionValue(field))) continue;
					const write = spec.parse(staged.text);
					if (write === undefined) plan.push({ field, run: undefined });
					else if (write.kind === "clear") plan.push({ field, run: () => this.clear(field) });
					else plan.push({ field, run: () => this.store(field, write.value) });
				}
				return plan;
			}
			async clear(field) {
				await this.scope.unset(field);
				return !this.stored(field);
			}
			async store(field, value) {
				await this.scope.set(field, value);
				return this.userLayer()?.[field] === value;
			}
			publish() {
				for (const listener of this.listeners) listener();
			}
			snapshot() {
				return this.scope.getSnapshot();
			}
			sectionValue(field) {
				return this.snapshot().value?.[field];
			}
			baseValue(field) {
				return this.snapshot().base?.[field];
			}
			userLayer() {
				return this.snapshot().user;
			}
			stored(field) {
				const user = this.userLayer();
				return user !== undefined && Object.hasOwn(user, field);
			}
		};
		//#endregion
		//#region lib/types/client/card.js
		function Card(props) {
			const state = props.state;
			if (!state.available) return (0, react_jsx_runtime.jsx)("div", { className: "cbgw-card", children: (0, react_jsx_runtime.jsx)("p", { className: "cbgw-readOnly", role: "status", children: props.t("unavailable") }) });
			const blocked = !state.dirty || state.invalid || state.saving;
			return (0, react_jsx_runtime.jsxs)("div", { className: "cbgw-card", children: [
				!state.writable ? (0, react_jsx_runtime.jsx)("p", { className: "cbgw-readOnly", role: "status", children: props.t("readOnly") }) : null,
				props.children,
				(0, react_jsx_runtime.jsxs)("div", { className: "cbgw-footer", children: [
					state.dirty ? (0, react_jsx_runtime.jsx)("span", { className: "cbgw-pending", children: props.t("unsaved") }) : null,
					state.failed ? (0, react_jsx_runtime.jsx)("p", { className: "cbgw-failed", role: "status", children: props.t("saveFailed") }) : null,
					(0, react_jsx_runtime.jsx)("button", { type: "button", className: "cbgw-button", disabled: !state.dirty || state.saving, onClick: props.onDiscard, children: props.t("discard") }),
					(0, react_jsx_runtime.jsx)("button", { type: "button", className: "cbgw-button cbgw-primary", disabled: blocked, onClick: props.onSave, children: props.t(state.saving ? "saving" : "save") })
				] })
			] });
		}
		function CannbotCard(props) {
			const t = props.t;
			const state = props.useCannbotCard((snapshot) => snapshot);
			if (props.view === "summary") return t("cardDescription");
			const disabled = !state.writable;
			return (0, react_jsx_runtime.jsx)(Card, {
				t,
				state,
				onSave: props.save,
				onDiscard: props.discard,
				children: [
					(0, react_jsx_runtime.jsx)(SecretField, {
						id: "cannbot-gateway-vk",
						label: t("vkLabel"),
						hint: t("vkHint"),
						disabled: !state.vkWritable,
						text: state.vk.text,
						configured: state.vkConfigured,
						stateLabel: state.vkConfigured ? t("vkSet") : t("vkUnset"),
						onEdit: (text) => { props.edit("vk", text); }
					}),
					(0, react_jsx_runtime.jsx)(ValueField, {
						id: "cannbot-gateway-display-name",
						label: t("displayNameLabel"),
						hint: t("displayNameHint"),
						overriddenLabel: t("overridden"),
						resetLabel: t("reset"),
						invalidLabel: t("invalid"),
						disabled,
						...state.displayName,
						onEdit: (text) => { props.edit("displayName", text); },
						onReset: () => { props.resetField("displayName"); }
					}),
					(0, react_jsx_runtime.jsx)(ValueField, {
						id: "cannbot-gateway-gateway-url",
						label: t("gatewayURLLabel"),
						hint: t("gatewayURLHint"),
						overriddenLabel: t("overridden"),
						resetLabel: t("reset"),
						invalidLabel: t("invalid"),
						disabled,
						...state.gatewayURL,
						onEdit: (text) => { props.edit("gatewayURL", text); },
						onReset: () => { props.resetField("gatewayURL"); }
					}),
				(0, react_jsx_runtime.jsx)(ValueField, {
					id: "cannbot-gateway-session-file",
					label: t("sessionFileLabel"),
					hint: t("sessionFileHint"),
					overriddenLabel: t("overridden"),
					resetLabel: t("reset"),
					invalidLabel: t("invalid"),
					disabled,
					...state.sessionFile,
					onEdit: (text) => { props.edit("sessionFile", text); },
					onReset: () => { props.resetField("sessionFile"); }
				}),
				(0, react_jsx_runtime.jsx)(ValueField, {
					id: "cannbot-gateway-models",
					multiline: true,
					rows: 5,
					label: t("modelsLabel"),
					hint: t("modelsHint"),
					overriddenLabel: t("overridden"),
					resetLabel: t("reset"),
					invalidLabel: t("modelsInvalid"),
					disabled,
					...state.models,
					onEdit: (text) => { props.edit("models", text); },
					onReset: () => { props.resetField("models"); }
				})
				]
			});
		}
		//#endregion
		//#region lib/types/client/controller.js
		const NS = "cannbot-gateway";
		const DEFAULT_VK_REF = "CANNBOT_VK";
		const VK_FIELD = "vk";
		function refOf(snapshot) {
			const declared = snapshot.value?.xApiKeyEnv ?? snapshot.base?.xApiKeyEnv;
			return typeof declared === "string" && declared.trim().length > 0 ? declared.trim() : DEFAULT_VK_REF;
		}
		var CannbotCardController = class {
			scope;
			ctx;
			form;
			store;
			unsubscribe;
			credential = { ref: "", configured: false, writable: true };
			constructor(scope, ctx) {
				this.scope = scope;
				this.ctx = ctx;
				this.form = new CardForm(scope, [textField("displayName"), textField("gatewayURL"), textField("sessionFile"), modelsField("models")], [{
					field: VK_FIELD,
					write: (text) => this.writeKey(text)
				}]);
				this.store = this.form.bind(() => this.projection());
				this.unsubscribe = scope.subscribe(() => { this.readCredential(); });
				this.readCredential();
			}
			projection() {
				return {
					...this.form.shell(),
					displayName: this.form.field("displayName"),
					gatewayURL: this.form.field("gatewayURL"),
					sessionFile: this.form.field("sessionFile"),
					models: this.form.field("models"),
					vk: this.form.field(VK_FIELD),
					vkConfigured: this.credential.configured,
					vkWritable: this.credential.writable
				};
			}
			async readCredential() {
				const ref = refOf(this.scope.getSnapshot());
				if (ref !== this.credential.ref) {
					this.credential = { ref, configured: false, writable: true };
					this.store.set(this.projection());
				}
				let response;
				try {
					response = await this.ctx.remote.credentials.describe([ref]);
				} catch (_credentialReadFailure) {
					return;
				}
				if (!response?.ok || ref !== refOf(this.scope.getSnapshot())) return;
				const view = response.value?.[ref];
				const next = {
					ref,
					configured: view?.configured ?? false,
					writable: view?.writable ?? true
				};
				if (next.configured === this.credential.configured && next.writable === this.credential.writable) return;
				this.credential = next;
				this.store.set(this.projection());
			}
			refreshCredential(ref) {
				if (ref !== this.credential.ref) return;
				this.readCredential();
			}
			inject() {
				return {
					hooks: { cannbotCard: this.store },
					...this.form.actions()
				};
			}
			async writeKey(value) {
				try {
					await this.ctx.remote.credentials.set(refOf(this.scope.getSnapshot()), value);
				} catch (_credentialWriteFailure) {}
				await this.readCredential();
				return this.credential.configured;
			}
			dispose() {
				this.unsubscribe?.();
				this.form.dispose();
			}
		};
		//#endregion
		//#region lib/types/client/index.js
		/** 必需的浏览器服务（cordis fiber inject）。 */
		const inject = ["slots", "locale", "remote", "remote.credentials", "configForms"];
		function apply(ctx) {
			const t = ctx.locale.bind(NS_LOCALE);
			ctx.effect(() => ctx.locale.register(NS_LOCALE, { zh, en }), "cannbot-gateway: card dictionaries");
			const controller = new CannbotCardController(ctx.configForms.get(NS), ctx);
			ctx.effect(() => () => {
				controller.dispose();
			}, "cannbot-gateway: form subscription");
			ctx.effect(() => ctx.remote.$on("credentials/reference-updated", (ref) => {
				controller.refreshCredential(ref);
			}), "cannbot-gateway: credential invalidations");
			ctx.effect(() => ctx.configForms.whileServed([NS], () => ctx.slots.inject("plugins.item", () => ctx.slots.register({
				name: "plugins.item",
				id: "cannbot-gateway",
				order: 50,
				label: () => t("cardTitle"),
				locale: NS_LOCALE,
				inject: () => controller.inject()
			}, CannbotCard))), "cannbot-gateway: card slot");
		}
		exports.inject = inject;
		exports.apply = apply;
		return module.exports;
	}
});

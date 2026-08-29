window.__ModuleLoader__.load({
	id: "dsh-cannbot-gateway",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		//#region lib/types/client/styles.js
		const css = ".cbgw-card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);border-radius:10px;padding:0;display:flex;flex-direction:column}.cbgw-header{display:flex;align-items:center;gap:8px;width:100%;background:0;border:0;cursor:pointer;font:inherit;text-align:left;padding:12px 14px;color:var(--dsw-alias-label-primary)}.cbgw-headText{display:flex;flex-direction:column;min-width:0;flex:1}.cbgw-name{font-size:13px;font-weight:600;line-height:1.5}.cbgw-description{font-size:12px;color:var(--dsw-alias-label-tertiary);line-height:1.5}.cbgw-pending{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}.cbgw-chevron{margin-left:auto;color:var(--dsw-alias-label-tertiary);transition:transform .15s ease}.cbgw-chevronOpen{transform:rotate(180deg)}.cbgw-body{display:flex;flex-direction:column;gap:4px;padding:2px 14px 12px;border-top:1px solid var(--dsw-alias-border-l2)}.cbgw-readOnly{color:var(--dsw-alias-label-tertiary);margin:8px 0 0;font-size:12px}.cbgw-field{display:flex;flex-direction:column;gap:6px;padding:12px 0}.cbgw-field+.cbgw-field{border-top:1px solid var(--dsw-alias-border-l2)}.cbgw-head{display:flex;align-items:center;gap:8px}.cbgw-label{min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:500;line-height:1.5}.cbgw-badges{display:inline-flex;align-items:center;gap:8px}.cbgw-badge{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}.cbgw-badgeMuted{white-space:nowrap;color:var(--dsw-alias-label-tertiary);border-radius:999px;padding:1px 8px;font-size:11px;line-height:17px}.cbgw-reset{font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0;border:none;padding:0;font-size:12px;line-height:1.5}.cbgw-reset:hover:not(:disabled){color:var(--dsw-alias-label-primary)}.cbgw-reset:disabled{cursor:default}.cbgw-input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}.cbgw-input:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}.cbgw-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}.cbgw-footer{display:flex;justify-content:flex-end;align-items:center;gap:8px;padding-top:10px}.cbgw-failed{color:var(--dsw-alias-label-error);margin:0 auto 0 0;font-size:12px}.cbgw-button{font:inherit;font-size:12px;cursor:pointer;border-radius:8px;padding:5px 12px;border:1px solid var(--dsw-alias-border-l2);background:0;color:var(--dsw-alias-label-secondary)}.cbgw-button:hover:not(:disabled){color:var(--dsw-alias-label-primary)}.cbgw-button:disabled{cursor:default;opacity:.5}.cbgw-primary{background:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-on-brand, #fff)}.cbgw-primary:hover:not(:disabled){color:var(--dsw-alias-label-on-brand, #fff);filter:brightness(1.05)}";
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
			cardDescription: "cannbot 虚拟密钥与网关连接（模型列表在 cordis.patch.yml 维护）",
			expand: "展开设置",
			collapse: "收起设置",
			unsaved: "未保存",
			readOnly: "本部署的设置为只读。",
			save: "保存",
			saving: "保存中…",
			discard: "放弃修改",
			saveFailed: "本部署没有接受这些值，已保留供你修改。",
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
			sessionFileHint: "cannbot 的 session.json 路径，JWT 自动从这里轮询刷新。"
		};
		const en = {
			cardTitle: "Cannbot Gateway",
			cardDescription: "cannbot virtual key and gateway connection (model list lives in cordis.patch.yml)",
			expand: "Show settings",
			collapse: "Hide settings",
			unsaved: "Unsaved",
			readOnly: "This deployment stores settings read-only.",
			save: "Save",
			saving: "Saving…",
			discard: "Discard",
			saveFailed: "The deployment did not accept these values; they were left for you to correct.",
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
			sessionFileHint: "Path of cannbot's session.json; the JWT is polled from here."
		};
		//#endregion
		//#region lib/types/client/fields.js
		function ValueField(props) {
			return (0, react_jsx_runtime.jsxs)("div", { className: "cbgw-field", children: [
				(0, react_jsx_runtime.jsxs)("div", { className: "cbgw-head", children: [
					(0, react_jsx_runtime.jsx)("label", { className: "cbgw-label", htmlFor: props.id, children: props.label }),
					props.overridden ? (0, react_jsx_runtime.jsxs)("span", { className: "cbgw-badges", children: [
						(0, react_jsx_runtime.jsx)("span", { className: "cbgw-badge", children: props.overriddenLabel }),
						(0, react_jsx_runtime.jsx)("button", { type: "button", className: "cbgw-reset", disabled: props.disabled, onClick: props.onReset, children: props.resetLabel })
					] }) : null
				] }),
				(0, react_jsx_runtime.jsx)("input", {
					id: props.id,
					className: "cbgw-input",
					type: "text",
					value: props.text,
					disabled: props.disabled,
					onChange: (event) => { props.onEdit(event.target.value); }
				}),
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
		//#region lib/types/client/card.js
		function Card(props) {
			const [open, setOpen] = (0, react.useState)(false);
			const { state } = props;
			if (!state.available) return null;
			const title = props.t(props.titleKey);
			const blocked = !state.dirty || state.invalid || state.saving;
			return (0, react_jsx_runtime.jsxs)("li", { className: "cbgw-card", children: [
				(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "cbgw-header",
					"aria-expanded": open,
					onClick: () => { setOpen(!open); },
					children: [
						(0, react_jsx_runtime.jsxs)("span", { className: "cbgw-headText", children: [
							(0, react_jsx_runtime.jsx)("span", { className: "cbgw-name", children: title }),
							(0, react_jsx_runtime.jsx)("span", { className: "cbgw-description", children: props.t(props.descriptionKey) })
						] }),
						state.dirty ? (0, react_jsx_runtime.jsx)("span", { className: "cbgw-pending", children: props.t("unsaved") }) : null,
						(0, react_jsx_runtime.jsx)("span", { className: "cbgw-chevron" + (open ? " cbgw-chevronOpen" : ""), children: "▾" })
					]
				}),
				open ? (0, react_jsx_runtime.jsxs)("div", { className: "cbgw-body", children: [
					!state.writable ? (0, react_jsx_runtime.jsx)("p", { className: "cbgw-readOnly", role: "status", children: props.t("readOnly") }) : null,
					props.children,
					(0, react_jsx_runtime.jsxs)("div", { className: "cbgw-footer", children: [
						state.failed ? (0, react_jsx_runtime.jsx)("p", { className: "cbgw-failed", role: "status", children: props.t("saveFailed") }) : null,
						(0, react_jsx_runtime.jsx)("button", { type: "button", className: "cbgw-button", disabled: !state.dirty || state.saving, onClick: props.onDiscard, children: props.t("discard") }),
						(0, react_jsx_runtime.jsx)("button", { type: "button", className: "cbgw-button cbgw-primary", disabled: blocked, onClick: props.onSave, children: props.t(state.saving ? "saving" : "save") })
					] })
				] }) : null
			] });
		}
		function CannbotCard(props) {
			const t = props.t;
			const state = props.useCannbotCard((snapshot) => snapshot);
			const disabled = !state.writable;
			return (0, react_jsx_runtime.jsxs)(Card, {
				t,
				titleKey: "cardTitle",
				descriptionKey: "cardDescription",
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
						disabled,
						...state.sessionFile,
						onEdit: (text) => { props.edit("sessionFile", text); },
						onReset: () => { props.resetField("sessionFile"); }
					})
				]
			});
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
		/** 暂存式表单：控件只上报草稿，保存才写；密钥经凭据域，其余走 settings 用户层。 */
		var CardForm = class {
			scope;
			specs;
			secretSpecs;
			staged = new Map();
			listeners = new Set();
			saving = false;
			failed = false;
			constructor(scope, specs, secrets = []) {
				this.scope = scope;
				this.specs = new Map(specs.map((spec) => [spec.field, spec]));
				this.secretSpecs = new Map(secrets.map((spec) => [spec.field, spec]));
				scope.subscribe(() => { this.publish(); });
			}
			bind(project) {
				const store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(project());
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
			api;
			form;
			store;
			credential = { ref: "", configured: false, writable: true };
			constructor(scope, api) {
				this.scope = scope;
				this.api = api;
				this.form = new CardForm(scope, [textField("displayName"), textField("gatewayURL"), textField("sessionFile")], [{
					field: VK_FIELD,
					write: (text) => this.writeKey(text)
				}]);
				this.store = this.form.bind(() => this.projection());
				scope.subscribe(() => { this.readCredential(); });
				this.readCredential();
			}
			projection() {
				return {
					...this.form.shell(),
					displayName: this.form.field("displayName"),
					gatewayURL: this.form.field("gatewayURL"),
					sessionFile: this.form.field("sessionFile"),
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
					response = await this.api.credentials.describe({ refs: [ref] });
				} catch (_credentialReadFailure) {
					return;
				}
				if (!response.result.ok || ref !== refOf(this.scope.getSnapshot())) return;
				const view = response.result.value.credentials[ref];
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
					await this.api.credentials.set({ ref: refOf(this.scope.getSnapshot()), value });
				} catch (_credentialWriteFailure) {}
				await this.readCredential();
				return this.credential.configured;
			}
		};
		//#endregion
		//#region lib/types/client/index.js
		/** 必需的浏览器服务（cordis fiber inject）。 */
		const inject = ["slots", "locale", "connection", "remote", "settingsScope"];
		function apply(ctx) {
			const { api } = ctx.get("connection");
			const t = ctx.locale.bind(NS_LOCALE);
			ctx.effect(() => ctx.locale.register(NS_LOCALE, { zh, en }), "cannbot-gateway: card dictionaries");
			const controller = new CannbotCardController(ctx.settingsScope.bind({ namespace: NS }), api);
			ctx.effect(() => ctx.remote.$on("credentials/reference-updated", (ref) => {
				controller.refreshCredential(ref);
			}), "cannbot-gateway: credential invalidations");
			ctx.slots.inject("settings.plugin.item", function* () {
				yield ctx.slots.register({
					name: "settings.plugin.item",
					key: NS,
					locale: NS_LOCALE,
					inject: () => controller.inject()
				}, CannbotCard);
			});
		}
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

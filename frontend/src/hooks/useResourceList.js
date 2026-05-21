import { useEffect, useState } from "react";

export const useResourceList = ({ controller, initialForm = {} } = {}) => {
	const [form, setForm] = useState(initialForm);
	const [editId, setEditId] = useState(null);
	const [errors, setErrors] = useState({});
	const [items, setItems] = useState([]);

	useEffect(() => {
		if (controller && typeof controller.load === "function") {
			Promise.resolve(controller.load())
				.then((data) => {
					if (Array.isArray(data)) {
						setItems(data);
					}
				})
				.catch(() => {});
		}
	}, [controller]);

	const resetForm = () => {
		setForm(initialForm);
		setEditId(null);
		setErrors({});
	};

	const handleEdit = (item) => {
		setEditId(item.id ?? null);
		setForm({ ...item });
		setErrors({});
	};

	const handleSubmit = async (e) => {
		if (e?.preventDefault) e.preventDefault();
		if (!controller) return;

		if (typeof controller.validate === "function") {
			const validationErrors = controller.validate(form) || {};
			setErrors(validationErrors);

			if (Object.keys(validationErrors).length > 0) {
				return;
			}
		} else {
			setErrors({});
		}

		try {
			if (editId && typeof controller.update === "function") {
				await controller.update(editId, form);
			} else if (typeof controller.create === "function") {
				await controller.create(form);
			}

			if (typeof controller.load === "function") {
				try {
					const data = await controller.load();
					if (Array.isArray(data)) {
						setItems(data);
					}
				} catch {}
			}

			resetForm();
		} catch (error) {
			if (error?.message) {
				setErrors({ submit: error.message });
			}
		}
	};

	const handleRemove = async (id) => {
		if (!controller || typeof controller.remove !== "function") return;
		await controller.remove(id);

		if (typeof controller.load === "function") {
			try {
				const data = await controller.load();
				if (Array.isArray(data)) {
					setItems(data);
				}
			} catch {}
		}
	};

	return {
		form,
		setForm,
		items,
		editId,
		errors,
		handleEdit,
		handleSubmit,
		handleRemove,
		resetForm,
	};
};

export default useResourceList;

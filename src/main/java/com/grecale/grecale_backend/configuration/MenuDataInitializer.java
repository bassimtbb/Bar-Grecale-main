package com.grecale.grecale_backend.configuration;

import com.grecale.grecale_backend.Domain.entities.Category;
import com.grecale.grecale_backend.Domain.entities.Item;
import com.grecale.grecale_backend.Domain.entities.ItemTag;
import com.grecale.grecale_backend.Domain.entities.Subcategory;
import com.grecale.grecale_backend.repository.CategoryRepository;
import com.grecale.grecale_backend.repository.ItemRepository;
import com.grecale.grecale_backend.repository.SubcategoryRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class MenuDataInitializer implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(MenuDataInitializer.class);

    private static final String DATA_RESOURCE_PATH = "data/menu-data.xlsx";

    private static final int CATEGORY_COLUMN = 0;
    private static final int SUBCATEGORY_COLUMN = 1;
    private static final int ITEM_NAME_COLUMN = 2;
    private static final int PRICE_COLUMN = 3;
    private static final int DESCRIPTION_COLUMN = 4;
    private static final int TAG_LABEL_COLUMN = 5;

    private final CategoryRepository categoryRepository;
    private final SubcategoryRepository subcategoryRepository;
    private final ItemRepository itemRepository;
    private final DataFormatter dataFormatter = new DataFormatter(Locale.ROOT);

    @Override
    public void run(String... args) {
        try {
            List<RawMenuRow> rows = loadMenuRows();
            if (rows.isEmpty()) {
                LOGGER.info("Menu data file '{}' is empty - skipping seeding", DATA_RESOURCE_PATH);
                return;
            }

            LOGGER.info("Seeding menu data ({} rows)", rows.size());
            itemRepository.deleteAll();
            subcategoryRepository.deleteAll();
            categoryRepository.deleteAll();

            Map<String, Category> categoriesByName = new LinkedHashMap<>();
            Map<String, Subcategory> subcategoriesByKey = new LinkedHashMap<>();
            int itemsCreated = 0;

            for (RawMenuRow row : rows) {
                try {
                    Category category = categoriesByName.computeIfAbsent(row.category(), this::createCategory);

                    Subcategory subcategory = null;
                    if (row.subcategory() != null && !row.subcategory().isBlank()) {
                        String subKey = category.getCode() + "|" + row.subcategory();
                        subcategory = subcategoriesByKey.computeIfAbsent(subKey, key -> createSubcategory(category, row.subcategory()));
                    }

                    Item item = new Item();
                    item.setName(row.name());
                    item.setDescription(row.description());
                    item.setPrice(parsePrice(row.price()));
                    item.setCategory(category);
                    item.setSubcategory(subcategory);
                    item.setPhotoUrl(null);
                    item.setTag(toItemTag(row.tagLabel()));

                    Item savedItem = itemRepository.save(item);
                    category.getItems().add(savedItem);
                    if (subcategory != null) {
                        subcategory.getItems().add(savedItem);
                    }
                    itemsCreated++;
                } catch (Exception itemException) {
                    LOGGER.error("Failed to process menu row for category '{}' / item '{}'", row.category(), row.name(), itemException);
                }
            }

            LOGGER.info("Menu data seeding completed: {} categories, {} subcategories, {} items",
                    categoriesByName.size(), subcategoriesByKey.size(), itemsCreated);
        } catch (IOException | InvalidFormatException ex) {
            LOGGER.error("Unable to seed menu data from '{}'", DATA_RESOURCE_PATH, ex);
        }
    }

    private List<RawMenuRow> loadMenuRows() throws IOException, InvalidFormatException {
        ClassPathResource resource = new ClassPathResource(DATA_RESOURCE_PATH);
        if (!resource.exists()) {
            LOGGER.warn("Menu data file '{}' not found - skipping import", DATA_RESOURCE_PATH);
            return List.of();
        }

        try (InputStream inputStream = resource.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                LOGGER.warn("Menu data workbook '{}' does not contain a first sheet", DATA_RESOURCE_PATH);
                return List.of();
            }

            List<RawMenuRow> rows = new ArrayList<>();
            for (Row row : sheet) {
                if (row == null || row.getRowNum() == 0) {
                    continue;
                }

                String category = readCell(row, CATEGORY_COLUMN);
                if (category.isBlank()) {
                    LOGGER.debug("Skipping row {} - empty category", row.getRowNum());
                    continue;
                }

                String subcategory = readCell(row, SUBCATEGORY_COLUMN);
                String name = readCell(row, ITEM_NAME_COLUMN);
                if (name.isBlank()) {
                    LOGGER.debug("Skipping row {} - empty item name", row.getRowNum());
                    continue;
                }

                String price = readCell(row, PRICE_COLUMN);
                String description = readCell(row, DESCRIPTION_COLUMN);
                String tagLabel = readCell(row, TAG_LABEL_COLUMN);

                rows.add(new RawMenuRow(category, subcategory, name, price, description, tagLabel));
            }

            return rows;
        }
    }

    private String readCell(Row row, int columnIndex) {
        Cell cell = row.getCell(columnIndex);
        String value = cell == null ? "" : dataFormatter.formatCellValue(cell);
        return value == null ? "" : value.trim();
    }

    private ItemTag toItemTag(String label) {
        if (label == null || label.isBlank()) {
            return null;
        }
        return new ItemTag(label, "menu-tag-default");
    }

    private Category createCategory(String categoryName) {
        Category category = new Category();
        category.setCode(slugify(categoryName));
        category.setName(categoryName);
        category.setIconUrl(null);
        category.setItems(new ArrayList<>());
        category.setSubcategories(new ArrayList<>());
        return categoryRepository.save(category);
    }

    private Subcategory createSubcategory(Category category, String subcategoryName) {
        Subcategory subcategory = new Subcategory();
        subcategory.setSlug(slugify(category.getCode() + "-" + subcategoryName));
        subcategory.setName(subcategoryName);
        subcategory.setPosition(category.getSubcategories().size() + 1);
        subcategory.setCategory(category);
        subcategory.setItems(new ArrayList<>());
        Subcategory saved = subcategoryRepository.save(subcategory);
        category.getSubcategories().add(saved);
        return saved;
    }

    private BigDecimal parsePrice(String priceText) {
        if (priceText == null || priceText.isBlank() || priceText.equalsIgnoreCase("N/A")) {
            return new BigDecimal("0.00");
        }

        String numeric = priceText
                .replaceAll("[^0-9.,]", "")
                .replace(',', '.');

        if (numeric.isBlank() || !numeric.matches(".*\\d.*")) {
            return new BigDecimal("0.00");
        }

        BigDecimal value = new BigDecimal(numeric);
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private String slugify(String source) {
        String normalized = Normalizer.normalize(source.toLowerCase(Locale.ROOT), Normalizer.Form.NFD);
        String withoutAccents = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String sanitized = withoutAccents.replaceAll("[^a-z0-9]+", "-");
        sanitized = sanitized.replaceAll("^-+|-+$", "");
        return sanitized.isEmpty() ? "categoria" : sanitized;
    }

    private record RawMenuRow(String category, String subcategory, String name, String price, String description, String tagLabel) {
    }
}


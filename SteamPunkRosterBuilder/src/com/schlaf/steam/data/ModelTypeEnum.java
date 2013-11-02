/**
 * 
 */
package com.schlaf.steam.data;

import java.util.ArrayList;
import java.util.List;

/**
 * @author S0085289
 *
 */
public enum ModelTypeEnum {

	WARCASTER("Warcaster"),
	WARLOCK("Warlock"),
	WARJACK("Warjacks"),
	WARBEAST("Warbeasts"),
	UNIT("Units"),
	UNIT_ATTACHMENT("Unit attachments"),
	WEAPON_ATTACHMENT("Weapon attachments"),
	SOLO("Solos"),
	BATTLE_ENGINE("Battle engines"),
	COLOSSAL("Colossals"),
	GARGANTUAN("Gargantuans"),
	SINGLE_MODEL_INCLUDED_ELSEWHERE("Other"), 
	MERCENARY_ELEMENTS("Mercenaries");
	
	private String title;
	private static List<ModelTypeEnum> entriesTypeForCardSearch;
	
	static {
		entriesTypeForCardSearch = new ArrayList<ModelTypeEnum>();
		entriesTypeForCardSearch.add(WARCASTER);
		entriesTypeForCardSearch.add(WARLOCK);
		entriesTypeForCardSearch.add(WARJACK);
		entriesTypeForCardSearch.add(WARBEAST);
		entriesTypeForCardSearch.add(UNIT);
		entriesTypeForCardSearch.add(UNIT_ATTACHMENT);
		entriesTypeForCardSearch.add(WEAPON_ATTACHMENT);
		entriesTypeForCardSearch.add(SOLO);
		entriesTypeForCardSearch.add(BATTLE_ENGINE);
		entriesTypeForCardSearch.add(COLOSSAL);
		entriesTypeForCardSearch.add(GARGANTUAN);
	}
	
	private ModelTypeEnum(String title) {
		this.title = title;
	}
	
	public String getTitle() {
		return title;
	}
	
	public String toString() {
		return title;
	}
	
	
	public static List<ModelTypeEnum> getEntriesTypeForCardSearch() {
		return entriesTypeForCardSearch;
	}
}
